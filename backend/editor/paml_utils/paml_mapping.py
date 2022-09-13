
from typing import List, TYPE_CHECKING
import sbol3

if TYPE_CHECKING:
    from editor.models import Protocol, ProtocolExecution, ProtocolSpecialization, Specialization


class PAMLMappingException(Exception):
    pass


class PAMLMapping():
    """
    This class maps paml library primitives to Django models so that they can be exposed to the API.
    The mapping from paml to models is incomplete so that the front end can include less data.
    """

    paml_libraries = ['liquid_handling', 'plate_handling',
                                   'spectrophotometry', 'sample_arrays']

    def _load_paml():
        import paml
        import uml
        for lib in PAMLMapping.paml_libraries:
            paml.import_library(lib)
        return paml, uml

    def graph_to_protocol(protocol: "Protocol", doc=None):
        """
        Convert an editor graph to a PAML protocol.
        """
        paml, uml = PAMLMapping._load_paml()

        name = protocol.name
        graph = protocol.graph

        if not doc:
            doc = sbol3.Document()
        sbol3.set_namespace('https://bbn.com/scratch/')

        protocol_name = "".join([c for c in name if c.isalpha() or c.isdecimal()])

        paml_protocol: paml.Protocol = paml.Protocol(protocol_name)
        paml_protocol.name = protocol_name
        # FIXME protocol.description = DOCSTRING
        doc.add(paml_protocol)

        # Ensure there is an initial and final node
        initial = paml_protocol.initial()
        final = paml_protocol.final()



        # Collect parameters for call behaviors
        parameters = PAMLMapping.map_parameters(graph)


        # Create protcol nodes
        node_to_call_behavior = {}
        for _, node in graph["nodes"].items():
            node_to_call_behavior[node['id']] = PAMLMapping.node_to_call_behavior(paml_protocol, protocol, node, parameters)

        # Create protocol edges
        for _, node in graph["nodes"].items():
            PAMLMapping.make_incoming_edges(paml_protocol, node, node_to_call_behavior)

        # protocol.to_dot().render(view=True)

        # Add ordering for all nodes wrt. initial and final
        for node in paml_protocol.nodes:
            if node != initial and node != final:
                paml_protocol.order(initial, node)
                paml_protocol.order(node, final)

        return paml_protocol

    def make_incoming_edges(paml_protocol, node, node_to_call_behavior,
                            skipped_nodes=["Input", "Parameter"]):
        """
        Add incoming edges to protocol node from graph edges
        """
        import paml
        import uml
        protocol_node = node_to_call_behavior[node['id']]

        if isinstance(protocol_node, uml.CallBehaviorAction):
            for input_pin_id, input_pin in node['inputs'].items():
                for source in input_pin["connections"]:
                    source_node_id = source['node']
                    source_output_id = source["output"]

                    if input_pin_id == "Start":
                        # Control Flow for Ordering
                        paml_protocol.order(node_to_call_behavior[source_node_id], protocol_node)
                    else:
                        # Data Flow
                        cba_input_pin = protocol_node.input_pin(input_pin_id)
                        source_call_behavior = node_to_call_behavior[source_node_id]

                        if isinstance(source_call_behavior, uml.ActivityParameterNode):
                                paml_protocol.use_value(source_call_behavior, cba_input_pin)
                        elif isinstance(source_call_behavior, uml.CallBehaviorAction):
                            # ActivityNode pin to pin connection
                            source_pin = source_call_behavior.output_pin(source_output_id)
                            paml_protocol.use_value(source_pin, cba_input_pin)
                        else: # Passthrough and Failure cases
                            if source_node_id not in node_to_call_behavior or \
                                not node_to_call_behavior[source_node_id]:
                                pass # This is a parameter that was already made into a value pin
                            else:
                                raise PAMLMappingException(f"Unable to process ObjectFlow for pin: {input_pin_id}")

        elif node["name"] == "Output":
            for input_pin_id, input_pin in node['inputs'].items():
                if len(input_pin["connections"]) == 0:
                    ## Protocol doesn't connect to output, but can still make the output
                    node = paml_protocol.designate_output(
                        node["data"]["name"],
                        PAMLMapping.map_type(node["data"]["type"]),
                        None # no source if no connections
                        )
                    # paml_protocol.nodes.append(node)
                else:
                    for source in input_pin["connections"]:
                        source_node_id = source['node']
                        source_output_id = source["output"]
                        # TODO ignoring source["data"] for now
                        source_call_behavior = node_to_call_behavior[source_node_id]
                        source_pin = source_call_behavior.output_pin(source_output_id)
                        output = paml_protocol.designate_output(node["data"]["name"], PAMLMapping.map_type(node["data"]["type"]), source_pin)
                        paml_protocol.order(source_call_behavior, output)
        elif node["name"] in skipped_nodes:
            pass
        else:
            raise PAMLMappingException(f"Do not know how to make incoming edges for node: {node}")

    def node_to_call_behavior(paml_protocol, protocol, node, parameters):
        """
        Convert a node representing a protocol activity into a call behavior
        """
        import uml
        import paml

        primitive = None
        try:
            primitive = paml.get_primitive(paml_protocol.document, name=node["name"])
        except Exception as e:
            pass

        subprotocol = None
        if not primitive:
            try:
                # subprotocol = Protocol.objects.get(name=node["name"])
                subprotocol = protocol.get_subprotocol(node["name"])
            except Exception as e:
                pass

        if primitive:
            input_pin_map = {}
            if node["id"] in parameters:
                input_pin_map = parameters[node["id"]]

            # Get ValuePins
            value_pin_map = {
                x.property_value.name: PAMLMapping.map_value(node['data'][x.property_value.name], x.property_value.type)
                for x in primitive.get_inputs()
                if x.property_value.direction == uml.PARAMETER_IN and
                   x.property_value.name in node['data']
            }

            node = paml_protocol.execute_primitive(primitive, **input_pin_map, **value_pin_map)
            paml_protocol.order(paml_protocol.initial(), node)
            return node
        elif "isModule" in node["data"] and node["data"]["isModule"]:
            # Subprotocol
            input_pin_map = {}
            if node["id"] in parameters:
                input_pin_map = parameters[node["id"]]
            paml_subprotocol = paml_protocol.document.find(f"{sbol3.get_namespace()}{node['name']}")
            if not paml_subprotocol:
                paml_subprotocol = PAMLMapping.graph_to_protocol(subprotocol, doc=paml_protocol.document)
            return paml_protocol.execute_primitive(paml_subprotocol, **input_pin_map)
        elif node["name"] == "Input":
            name = node["data"]['name']
            node_type = sbol3.Identified # eval(node["data"]['type'])
            optional = True # node["data"]['optional']
            default_value = None # eval(node["data"]['default'])
            param = paml_protocol.input_value(
                name,
                node_type,
                optional=optional,
                default_value=default_value
                )
            return param
        elif node["name"] == "Output":
            if 'output' in protocol.graph["nodes"][str(node['id'])]['inputs']:
                sources = protocol.graph["nodes"][str(node['id'])]['inputs']['output']['connections']

            if len(sources) > 1:
                raise PAMLMappingException(f"There is more than one Activity linked to the Output node: {node}")
            # elif len(sources) == 0:
            #     param = protocol.add_output(
            #         node["data"]['name'],
            #         node["data"]['type']
            #         )
            #     # param_node = uml.ActivityParameterNode(parameter=param)
            #     # protocol.nodes.append(param_node)

            #     return param
            # if len(sources) == 1:
            #     pass

            # Do not create the protocol output here, handle when looking at edges.  The designate_output function will create an output.
            else:
                return None
        elif node["name"] == "Parameter":
            return None
        else:
            raise PAMLMappingException(f"Do not know how to convert node: {node}")

    def map_parameters(graph):
        ## Find the Parameter nodes and make a mapping from Activity nodes to parameter, value pairs
        parameters = {}
        for _, node in graph["nodes"].items():
            if node["name"] == "Parameter":
                parameters = PAMLMapping.map_parameter(node, graph, parameters) # side effect setting parameters
        return parameters

    def map_parameter(node, graph, parameters):
        ## Need to create a parameter object and save for populating the Activities it connects with
        for activity_node in node["outputs"]["output"]["connections"]:
            # This parameter node is a parameter for the activity_node
            parameter_value = PAMLMapping.map_value(node["data"]["value"], node["data"]["type"])
            activity_graph_node = graph["nodes"][str(activity_node["node"])]

            if activity_graph_node["id"] not in parameters:
                parameters[activity_graph_node["id"]] = {}

            parameters[activity_graph_node["id"]][activity_node["input"]] = parameter_value

        return parameters


    def map_value(value, value_type):
        ## Convert value to a literal
        import uml

        type_map = {
            'http://www.ontology-of-units-of-measure.org/resource/om-2/Measure'
 : PAMLMapping.map_measure,
            'http://bioprotocols.org/paml#SampleData' : PAMLMapping.map_sample_data,
        }

        if value_type in type_map:
            handler = type_map[value_type]
        # if value['paml_type'] in type_map:
        #     handler = type_map[value['paml_type']]
            return handler(value, value_type)
        else:
            raise ValueError(f"Cannot covert parameter of type {value['paml_type']}. Do you need a new handler?")


    def map_measure(value, value_type):
        import tyto
        import uml
        measure_value = float(value["value"])
        measure_units = value["unit"]
        unit_type = eval(f"tyto.OM.{measure_units}")
        return uml.literal(sbol3.Measure(measure_value, unit_type))

    def map_sample_data(value, value_type):
        pass

    def map_type(string_type):
        """
        Map the type specified in the string to a PAML type
        """
        return sbol3.Identified


    def reload_models():
        paml, _ = PAMLMapping._load_paml()
        for l, lib_doc in paml.loaded_libraries.items():
            for p in lib_doc.objects:
                PAMLMapping._initialize_primitive(p, l)

    def _initialize_primitive(p, library):
        """
        Convert primtitive p to a model.
        """

        from editor.models import Primitive, PrimitiveInput, PrimitiveOutput

        if not Primitive.objects.filter(name=p.display_id, library=library).exists():
            p_instance = Primitive(name=p.display_id, library=library)
            p_instance.save()

            inputs = [ PrimitiveInput(name=i.property_value.name,
                                    type=i.property_value.type,
                                    primitive=p_instance)
                    for i in p.get_inputs() ]

            outputs = [ PrimitiveOutput(name=i.property_value.name,
                                        type=i.property_value.type,
                                        primitive=p_instance)
                    for i in p.get_outputs() ]

            for param in inputs + outputs:
                param.save()

    def get_specializations():
        import paml_convert

        specializations = [cls.__name__ for cls in paml_convert.BehaviorSpecialization.__subclasses__()]
        return specializations

    def specialize(
        protocol: "Protocol",
        specializations: List["Specialization"],
        protocol_specialization: "ProtocolSpecialization"
    ):
        paml, uml = PAMLMapping._load_paml()
        import sbol3
        import paml_convert
        from paml.execution_engine import ExecutionEngine

        specialization_classes = {specialization.id : getattr(paml_convert, specialization.name)
                                   for specialization in specializations}
        specialization_objects = {id : specialization_class()
                                   for id, specialization_class in specialization_classes.items()}
        paml_protocol = PAMLMapping.graph_to_protocol(protocol)
        ee = ExecutionEngine(
            specializations=specialization_objects.values(),
            permissive=True # Allow execution to proceed even if not all pins have tokens (i.e., control flow only)
            )
        parameter_values = [] # FIXME
        execution_id = f"protocol_specialization_{protocol_specialization.id}"
        execution = ee.execute(
            paml_protocol,
            sbol3.Agent("pamled_agent"),
            parameter_values,
            id=execution_id,
            start_time=None
        )
        specialization_data = {id: s.data for id, s in specialization_objects.items()}
        return specialization_data

    def execute(
        protocol: "Protocol",
        protocol_execution: "ProtocolExecution"
    ):
        paml, uml = PAMLMapping._load_paml()
        import sbol3
        from paml.execution_engine import ExecutionEngine


        paml_protocol = PAMLMapping.graph_to_protocol(protocol)
        ee = ExecutionEngine()
        parameter_values = [] # FIXME
        execution_id = f"protocol_execution_{protocol_execution.id}"
        execution = ee.execute(
            paml_protocol,
            sbol3.Agent("pamled_agent"),
            parameter_values,
            id=execution_id,
            start_time=None
        )
        execution_serialization = execution.document.write_string(file_format=sbol3.SORTED_NTRIPLES)
        # execution.to_json()
        return execution_serialization

