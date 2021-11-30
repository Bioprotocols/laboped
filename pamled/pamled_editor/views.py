from django.http.response import ResponseHeaders
from django.shortcuts import render
from django.core.files.base import ContentFile
from pamled_editor.models import Primitive
from pamled_editor.models import PAMLMapping

from pamled_editor.models import Protocol
from pamled_editor.protocol.protocol import Protocol as PAMLProtocol
from pamled_editor.serializers import PrimitiveSerializer, ProtocolSerializer
# Create your views here.

from django.http import HttpResponse
from rest_framework import viewsets

def rebuild(request):
    PAMLMapping.reload_models()
    return HttpResponse(f"Rebuilt: {Primitive.objects.all()}")

class PrimitiveView(viewsets.ModelViewSet):
    serializer_class = PrimitiveSerializer
    queryset = Primitive.objects.all()

class ProtocolView(viewsets.ModelViewSet):
    serializer_class = ProtocolSerializer
    queryset = Protocol.objects.all()

    def create(self, request):
        protocols = [Protocol(name=p['name'], graph=p['graph'], rdf_file=p['rdf_file']) for p in request.data]
        for p in protocols:
            p.save()
        return HttpResponse(f"Saved {len(request.data)} protocols.")
        # my_protocol = PAMLProtocol(protocol_id)
        # cf = ContentFile(my_protocol.to_rdf())
        # p = Protocol(name=protocol_id, rdf_file=cf)
        # p.rdf_file.save(f"{p.name}.nt", cf)
        # p.save()