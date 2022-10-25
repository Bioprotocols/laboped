import sys
import sbol3
from io import StringIO


class Protocol:
    def __init__(self, name) -> None:
        import labop
        import sbol3

        self.doc = sbol3.Document()
        sbol3.set_namespace("https://bbn.com/scratch/")
        self.protocol: labop.Protocol = labop.Protocol(name)
        self.protocol.name = name

    def to_rdf(self, format=sbol3.SORTED_NTRIPLES):
        return self.doc.write_string(format)

    def __str__(self):
        return self.to_rdf()
