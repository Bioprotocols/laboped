from django.db import models
from jsonfield import JSONField
import sbol3
import tyto

from accounts.models import User
from django_oso.models import AuthorizedModel
from django.core.files.base import ContentFile

# Create your models here.

class Protocol(AuthorizedModel):
    id = models.BigAutoField(primary_key=True, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    graph = models.JSONField()
    rdf_file = models.FileField(upload_to='editor/protocols/', null=True)

    def to_rdf_string(self, format="nt"):
        return Protocol.to_paml(self.name, self.graph).document.write_string(format)

    @classmethod
    def to_paml(cls, name, graph):
        return PAMLMapping.graph_to_protocol(name, graph)


class Primitive(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    library = models.CharField(max_length=100)

    def get_inputs(self):
        return PrimitiveInput.objects.filter(primitive=self.name).distinct()

    def get_outputs(self):
        return PrimitiveOutput.objects.filter(primitive=self.name).distinct()


class Pin(models.Model):
    id = models.BigAutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    units = models.CharField(max_length=100)


class PrimitiveInput(Pin):
    primitive = models.ForeignKey(Primitive, related_name='inputs', on_delete=models.CASCADE)

class PrimitiveOutput(Pin):
    primitive = models.ForeignKey(Primitive, related_name='outputs', on_delete=models.CASCADE)

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

    def graph_to_protocol(name, graph):
        """
        Convert an editor graph to a PAML protocol.
        """
        paml, uml = PAMLMapping._load_paml()

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

        protocol.to_dot().render(view=True)

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
                        if source_node_id in node_to_call_behavior and \
                        node_to_call_behavior[source_node_id]:
                            # pin to pin connection
                            source_call_behavior = node_to_call_behavior[source_node_id]

                            if isinstance(source_call_behavior, uml.ActivityParameterNode):
                                protocol.use_value(source_call_behavior, cba_input_pin)
                            else: # ActivityNode
                                source_pin = source_call_behavior.output_pin(source_output_id)
                                protocol.use_value(source_pin, cba_input_pin)
                        else:
                            # connection was from a Parameter node
                            pass

        elif node["name"] == "Output":
            #source = graph["nodes"][str(node['id'])]['inputs']['input']['connections'][0] #FIXME assumes that the source is present
            for input_pin_id, input_pin in node['inputs'].items():
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

        if primitive:
            input_pin_map = {}
            if node["id"] in parameters:
                input_pin_map = parameters[node["id"]]

            return protocol.execute_primitive(primitive, **input_pin_map)
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
            elif len(sources) == 1:
                param = protocol.add_output(
                    node["data"]['name'],
                    node["data"]['type']
                    )
                # param_node = uml.ActivityParameterNode(parameter=param)
                # protocol.nodes.append(param_node)

                return param
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

