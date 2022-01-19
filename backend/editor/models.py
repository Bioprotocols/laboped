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

    @classmethod
    def create(cls, **kwargs):
        protocol = cls(**kwargs)
        p_rdf = Protocol.to_rdf(protocol.graph)
        cf = ContentFile(p_rdf.document.write_string("nt"))
        protocol.rdf_file = cf
        protocol.rdf_file.save(f"{protocol.name}.nt", cf)
        return protocol

    @classmethod
    def to_rdf(cls, graph):
        return PAMLMapping.graph_to_protocol(graph)


class Primitive(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    library = models.CharField(max_length=100)

    def get_inputs(self):
        return PrimitiveInput.objects.filter(primitive=self).distinct()

    def get_outputs(self):
        return PrimitiveOutput.objects.filter(primitive=self).distinct()


class Pin(models.Model):
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

    def graph_to_protocol(graph):
        """
        Convert an editor graph to a PAML protocol.
        """
        paml, uml = PAMLMapping._load_paml()

        doc = sbol3.Document()
        sbol3.set_namespace('https://bbn.com/scratch/')

        name = "".join([c for c in graph['id'] if c.isalpha() or c.isdecimal()])

        protocol: paml.Protocol = paml.Protocol(name)
        protocol.name = name
        # FIXME protocol.description = DOCSTRING
        doc.add(protocol)

        # Create protcool nodes
        node_to_call_behavior = {}
        for _, node in graph["nodes"].items():
            node_to_call_behavior[node['id']] = PAMLMapping.node_to_call_behavior(protocol, graph, node)

        # Create protocol edges
        for _, node in graph["nodes"].items():
            PAMLMapping.make_incoming_edges(protocol, graph, node, node_to_call_behavior)

        return protocol

    def make_incoming_edges(protocol, graph, node, node_to_call_behavior,
                            skipped_nodes=["Input"]):
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
                    source_call_behavior = node_to_call_behavior[source_node_id]
                    source_pin = source_call_behavior.output_pin(source_output_id)
                    cba_input_pin = protocol_node.input_pin(input_pin_id)
                    protocol.use_value(source_pin, cba_input_pin)
        elif node["name"] == "Output":
            #source = graph["nodes"][str(node['id'])]['inputs']['input']['connections'][0] #FIXME assumes that the source is present
            for input_pin_id, input_pin in node['inputs'].items():
                for source in input_pin["connections"]:
                    source_node_id = source['node']
                    source_output_id = source["output"]
                    # TODO ignoring source["data"] for now
                    source_call_behavior = node_to_call_behavior[str(source_node_id)]
                    source_pin = source_call_behavior.get_output(source_output_id)
                    node.use_value(source_pin, node)
        elif node["name"] in skipped_nodes:
            pass
        else:
            raise PAMLMappingException(f"Do not know how to make incomeing edges for node: {node}")

    def node_to_call_behavior(protocol, graph, node):
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
            return protocol.execute_primitive(primitive)
        elif node["name"] == "Input":
            name = "foo" # node["data"]['name']
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
            source = graph["nodes"][str(node['id'])]['inputs']['input']['connections'][0] #FIXME assumes that the source is present

            param = protocol.add_output(
                node["data"]['name'],
                node["data"]['type']
                )
            param_node = uml.ActivityParameterNode(parameter=param)
            protocol.nodes.append(param_node)

            return param
        else:
            raise PAMLMappingException(f"Do not know how to covert node: {node}")




    def reload_models():
        paml, _ = PAMLMapping._load_paml()
        for l, lib_doc in paml.loaded_libraries.items():
            for p in lib_doc.objects:
                PAMLMapping._initialize_primitive(p, l)

    def _initialize_primitive(p, library):
        """
        Convert primtitive p to a model.
        """
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

