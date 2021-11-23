from django.shortcuts import render
from django.core.files.base import ContentFile
from pamled_editor.models import Primitive
from pamled_editor.models import PAMLMapping

from pamled_editor.models import Protocol
from pamled_editor.protocol.protocol import Protocol as PAMLProtocol
from pamled_editor.serializers import PrimitiveSerializer
# Create your views here.

from django.http import HttpResponse
# from django.views.generic import TemplateView
# from django.template import loader
from rest_framework import viewsets

# class Index(TemplateView):
#     template_name = "pamled/index.html"

# def home(request):
#     template = loader.get_template(Index.template_name)
#     context = {}
#     return HttpResponse(template.render(context, request))
#     # return HttpResponse("Hello, Django!")

def protocol(request, protocol_id):
    p =  Protocol.objects.filter(pk=protocol_id)
    if len(p) == 0:
        my_protocol = PAMLProtocol(protocol_id)
        cf = ContentFile(my_protocol.to_rdf())
        p = Protocol(name=protocol_id, rdf_file=cf)
        p.rdf_file.save(f"{p.name}.nt", cf)
        p.save()
    else:
        p = [p]
    return HttpResponse(f"New Protocol! {p}")

def lib(request, lib=None, primitive=None):
    primitives = Primitive.objects.all()            
        
    return HttpResponse(f"Library: {primitives}")

def rebuild_lib(request):
    PAMLMapping.reload_models()
        
    return HttpResponse(f"Rebuilt: {Primitive.objects.all()}")

class PrimitiveView(viewsets.ModelViewSet):
    serializer_class = PrimitiveSerializer
    queryset = Primitive.objects.all()