from rest_framework import serializers
from pamled_editor.models import Primitive, Pin, PrimitiveInput, PrimitiveOutput


# class ParameterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Parameter
#         fields = ['name', 'type', 'units']

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

 

    # def create(self, validated_data):
    #     inputs_data = validated_data.pop('inputs').distinct()
    #     outputs_data = validated_data.pop('outputs').distinct()
    #     primitive = Primitive.objects.create(**validated_data)
    #     for input_data in inputs_data:
    #         PrimitiveInput.objects.create(primitive=primitive, **input_data)
    #     for output_data in outputs_data:
    #         PrimitiveOutput.objects.create(primitive=primitive, **output_data)
    #     return primitive
