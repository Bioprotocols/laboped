from django.http.response import JsonResponse, ResponseHeaders
from django.shortcuts import render
from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.db.models import Min
from django.db.models.query import QuerySet

from rest_framework import viewsets
from editor.models import Primitive
from editor.models import PAMLMapping

from editor.models import Protocol
from editor.protocol.protocol import Protocol as PAMLProtocol
from editor.serializers import PrimitiveSerializer, ProtocolSerializer
# Create your views here.

from django.http import HttpResponse, Http404

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.exceptions import NotAuthenticated
from rest_framework.decorators import action

from django_oso.auth import authorize


class PrimitiveViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PrimitiveSerializer
    queryset = Primitive.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def rebuild(self, request, *args, **kwargs):
        print("Rebuilding primitives...")
        PAMLMapping.reload_models()
        return HttpResponse(f"Rebuilt: {Primitive.objects.all()}")


class ProtocolViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProtocolSerializer
    queryset = Protocol.objects.all()

    def create(self, request):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        user = request.user
        saved = []
        for p in request.data:
            try:
                if p['id'] is not None:
                    protocol = Protocol.objects.get(id=p['id'])
                    protocol.id = p['id']
                    protocol.name = p['name']
                    protocol.graph = p['graph']
                    protocol.rdf_file = p['rdf_file']
                else:
                    protocol = Protocol.create(
                                        id=p['id'],
                                        owner=user,
                                        name=p['name'],
                                        graph=p['graph'],
                                        rdf_file=p['rdf_file'])
                protocol.save()
                saved.append(protocol)
            except Exception as e:
                pass
        return JsonResponse({
            'message': f"Saved {len(request.data)} protocols.",
            'saved': saved
            })

    def list(self, request):
        if not request.user.is_authenticated:
            raise NotAuthenticated

        qset = Protocol.objects.authorize(request, action="GET")
        queryset = self.filter_queryset(qset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=True)
    def download(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        protocol: Protocol = self.get_object()
        authorize(request, protocol)
        fname = slugify(protocol.name)
        with protocol.rdf_file.open() as f:
            file_data = f.read()
        response = HttpResponse(file_data, content_type="application/octet-stream")
        response['Content-Disposition'] = f'attachment;filename="{fname}.txt"'
        return response

    @action(detail=True)
    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        protocol: Protocol = self.get_object()
        authorize(request, protocol, action="DELETE")
        protocol.delete()
        return HttpResponse(f"Deleted protocol {protocol.id}.")
