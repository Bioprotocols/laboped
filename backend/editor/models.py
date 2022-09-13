from typing import List
from django.db import models
from jsonfield import JSONField
import sbol3
import tyto

from accounts.models import User
from django_oso.models import AuthorizedModel
from django.core.files.base import ContentFile

from editor.paml_utils.paml_mapping import PAMLMapping

# Create your models here.

class Protocol(AuthorizedModel):
    id = models.BigAutoField(primary_key=True, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    graph = models.JSONField()
    rdf_file = models.FileField(upload_to='editor/protocols/', null=True)

    def get_specializations(self):
        specializations = ProtocolSpecialization.objects.filter(protocol=self)
        return specializations

    def get_executions(self):
        executions = ProtocolExecution.objects.filter(protocol=self)
        return executions

    def to_rdf_string(self, format="nt"):
        return Protocol.to_paml(self.name, self.graph).document.write_string(format)

    def get_subprotocol(self, subprotocol_name):
        return Protocol.objects.get(name=subprotocol_name)

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

class Specialization(models.Model):
    id = models.BigAutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=100)

def specialization_path(instance, filename):
        return 'editor/protocols/{0}/specializations/{1}/{2}'.format(instance.protocol, instance.specialization, filename)

class ProtocolSpecialization(models.Model):
    id = models.BigAutoField(primary_key=True, editable=False)
    protocol = models.ForeignKey(Protocol, related_name='protocol', on_delete=models.CASCADE)
    specialization = models.ForeignKey(Specialization, related_name='specialization', on_delete=models.CASCADE)
    data = models.TextField()

class ProtocolExecution(AuthorizedModel):
    id = models.BigAutoField(primary_key=True, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE)
    data = models.TextField(null=True)



