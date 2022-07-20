
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

    def graph_to_protocol(name, graph, doc=None):
        """
        Convert an editor graph to a PAML protocol.
        """
        paml, uml = PAMLMapping._load_paml()

        if not doc:
            doc = sbol3.Document()
        sbol3.set_namespace('https://bbn.com/scratch/')

        protocol_name = "".join([c for c in name if c.isalpha() or c.isdecimal()])

        protocol: paml.Protocol = paml.Protocol(protocol_name)
        protocol.name = protocol_name
        # FIXME protocol.description = DOCSTRING
        doc.add(protocol)


        # Collect parameters for call behaviors
        parameters = PAMLMapping.map_parameters(graph)


        # Create protcol nodes
        node_to_call_behavior = {}
        for _, node in graph["nodes"].items():
            node_to_call_behavior[node['id']] = PAMLMapping.node_to_call_behavior(protocol, graph, node, parameters)

        # Create protocol edges
        for _, node in graph["nodes"].items():
            PAMLMapping.make_incoming_edges(protocol, graph, node, node_to_call_behavior)

        # protocol.to_dot().render(view=True)

        return protocol

    def make_incoming_edges(protocol, graph, node, node_to_call_behavior,
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
                        protocol.order(node_to_call_behavior[source_node_id], protocol_node)
                    else:
                        # Data Flow
                        cba_input_pin = protocol_node.input_pin(input_pin_id)
                        source_call_behavior = node_to_call_behavior[source_node_id]

                        if isinstance(source_call_behavior, uml.ActivityParameterNode):
                                protocol.use_value(source_call_behavior, cba_input_pin)
                        elif isinstance(source_call_behavior, uml.CallBehaviorAction):
                            # ActivityNode pin to pin connection
                            source_pin = source_call_behavior.output_pin(source_output_id)
                            protocol.use_value(source_pin, cba_input_pin)
                        else: # Passthrough and Failure cases
                            if source_node_id not in node_to_call_behavior or \
                                not node_to_call_behavior[source_node_id]:
                                pass # This is a parameter that was already made into a value pin
                            else:
                                raise PAMLMappingException(f"Unable to process ObjectFlow for pin: {input_pin_id}")

        elif node["name"] == "Output":
            #source = graph["nodes"][str(node['id'])]['inputs']['input']['connections'][0] #FIXME assumes that the source is present
            for input_pin_id, input_pin in node['inputs'].items():
                if len(input_pin["connections"]) == 0:
                    ## Protocol doesn't connect to output, but can still make the output
                    output = protocol.add_output(node["data"]["name"], PAMLMapping.map_type(node["data"]["type"]))
                else:
                    for source in input_pin["connections"]:
                        source_node_id = source['node']
                        source_output_id = source["output"]
                        # TODO ignoring source["data"] for now
                        source_call_behavior = node_to_call_behavior[source_node_id]
                        source_pin = source_call_behavior.output_pin(source_output_id)
                        output = protocol.designate_output(node["data"]["name"], PAMLMapping.map_type(node["data"]["type"]), source_pin)
                        protocol.order(source_call_behavior, output)
        elif node["name"] in skipped_nodes:
            pass
        else:
            raise PAMLMappingException(f"Do not know how to make incoming edges for node: {node}")

    def node_to_call_behavior(protocol, graph, node, parameters):
        """
        Convert a node representing a protocol activity into a call behavior
        """
        import uml
        import paml

        primitive = None
        try:
            primitive = paml.get_primitive(protocol.document, name=node["name"])
        except Exception as e:
            pass

        subprotocol = None
        if not primitive:
            try:
                subprotocol = Protocol.objects.get(name=node["name"])
            except Exception as e:
                pass

        if primitive:
            input_pin_map = {}
            if node["id"] in parameters:
                input_pin_map = parameters[node["id"]]
            node = protocol.execute_primitive(primitive, **input_pin_map)
            protocol.order(protocol.initial(), node)
            return node
        elif "isModule" in node["data"] and node["data"]["isModule"]:
            # Subprotocol
            input_pin_map = {}
            if node["id"] in parameters:
                input_pin_map = parameters[node["id"]]
            paml_subprotocol = protocol.document.find(f"{sbol3.get_namespace()}{node['name']}")
            if not paml_subprotocol:
                paml_subprotocol = PAMLMapping.graph_to_protocol(node["name"],  subprotocol.graph, doc=protocol.document)
            return protocol.execute_primitive(paml_subprotocol, **input_pin_map)
        elif node["name"] == "Input":
            name = node["data"]['name']
            node_type = sbol3.Identified # eval(node["data"]['type'])
            optional = True # node["data"]['optional']
            default_value = None # eval(node["data"]['default'])
            param = protocol.input_value(
                name,
                node_type,
                optional=optional,
                default_value=default_value
                )
            return param
        elif node["name"] == "Output":
            sources = graph["nodes"][str(node['id'])]['inputs']['input']['connections']

            if len(sources) > 1:
                raise PAMLMappingException(f"There is more than one Activity linked to the Output node: {node}")
            # elif len(sources) == 1:
            #     param = protocol.add_output(
            #         node["data"]['name'],
            #         node["data"]['type']
            #         )
            #     # param_node = uml.ActivityParameterNode(parameter=param)
            #     # protocol.nodes.append(param_node)

            #     return param
            # Do not create the protocol output here, handle when looking edges.  The designate_output function will create an output.
            else:
                return None
        elif node["name"] == "Parameter":
            return None
        else:
            raise PAMLMappingException(f"Do not know how to covert node: {node}")

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
        ## Take the string value and the string type, and convert it into paramaterValuePair
        import uml

        return uml.literal(value)

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
        paml_protocol = PAMLMapping.graph_to_protocol(protocol.name, protocol.graph)
        ee = ExecutionEngine(specializations=specialization_objects.values())
        parameter_values = [] # FIXME
        execution_id = f"protocol_specialization_{protocol_specialization.id}"
        execution = ee.execute(
            paml_protocol,
            sbol3.Agent("pamled_agent"),
            parameter_values,
            id=execution_id,
            start_time=None,
            permissive=True # Allow execution to proceed even if not all pins have tokens (i.e., control flow only)
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


        paml_protocol = PAMLMapping.graph_to_protocol(protocol.name, protocol.graph)
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

