from rest_framework import serializers
from editor.models import ProtocolExecution
from editor.models import ProtocolSpecialization
from editor.models import Specialization
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

class ProtocolSpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProtocolSpecialization
        fields = ('id', 'data')

class ProtocolSerializer(serializers.ModelSerializer):
    specializations = ProtocolSpecializationSerializer(many=True, read_only=True, source="get_specializations")
    class Meta:
        model = Protocol
        fields = ('id', 'name', 'graph', 'rdf_file', 'specializations')

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ('id', 'name')

class ProtocolExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProtocolExecution
        fields = ('id', 'data')