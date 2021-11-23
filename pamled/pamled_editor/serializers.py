from rest_framework import serializers
from pamled_editor.models import Primitive

class PrimitiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Primitive
        fields = ('name', 'library')