from django.test import TestCase
import os
import json
from editor.models import Protocol

# Create your tests here.


class GraphToLABOPTestCase(TestCase):
    graph_json_file = os.path.join(
        os.path.dirname(__file__), "tests/resources/graph.json"
    )

    def setUp(self):
        with open(self.graph_json_file, "r") as f:
            self.json_graph = json.load(f)

    def test_graph_to_labop(self):
        labop_protocol = Protocol.to_rdf(None, self.json_graph)
        assert labop_protocol
