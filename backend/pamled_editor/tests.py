from django.test import TestCase
import os
import json
from pamled_editor.models import PAMLMapping

# Create your tests here.

class GraphToPAMLTestCase(TestCase):
    graph_json_file = os.path.join(os.path.dirname(__file__), "tests/resources/graph.json")

    def setUp(self):
        with open(self.graph_json_file, "r") as f:
            self.json_graph = json.load(f)

    def test_graph_to_paml(self):
        paml_protocol = PAMLMapping.graph_to_protocol(self.json_graph)
        assert(paml_protocol)