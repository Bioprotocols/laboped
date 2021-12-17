from rest_framework import serializers
from editor.models import Protocol
from editor.models import Primitive, Pin, PrimitiveInput, PrimitiveOutput

class PinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pin
        fields = ['name', 'type', 'units']

class PrimitiveSerializer(serializers.ModelSerializer):
    inputs = PinSerializer(many=True, read_only=True, source="get_inputs")
    outputs = PinSerializer(many=True, read_only=True, source="get_outputs")

    class Meta:
        model = Primitive
        fields = ('name', 'library', 'inputs', 'outputs')

class ProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Protocol
        fields = ('name', 'graph', 'rdf_file')