from asyncio import protocols
from gzip import READ
from django.http.response import JsonResponse, ResponseHeaders
from django.shortcuts import render
from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.db.models import Min
from django.db.models.query import QuerySet

from rest_framework import viewsets
from editor.models import ProtocolSpecialization
from editor.models import Specialization
from editor.models import Primitive
from editor.models import PAMLMapping

from editor.models import Protocol
from editor.protocol.protocol import Protocol as PAMLProtocol
from editor.serializers import PrimitiveSerializer, ProtocolSerializer, SpecializationSerializer, ProtocolSpecializationSerializer
# Create your views here.

from django.http import HttpResponse, Http404, HttpResponseServerError

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
        created = []
        to_update = []
        update_fields = ['name', 'graph', 'rdf_file']
        for p in request.data:
            try:
                if p['id'] is not None:
                    print(f"Updating protocol with id: {p['id']}")
                    protocol = Protocol.objects.get(id=p['id'])
                    protocol.name = p['name']
                    protocol.graph = p['graph']
                    protocol.rdf_file = p['rdf_file']
                    to_update.append(protocol)
                else:
                    protocol = Protocol.objects.create(owner=user,
                                                       name=p['name'],
                                                       graph=p['graph'],
                                                       rdf_file=p['rdf_file'])
                    print(f"Creating new protocol with id: {protocol.id}")
                    created.append(protocol)
            except Exception as e:
                print(e)

        updated = None
        print(f"Updating {len(to_update)} protocols... ", end="")
        try:
            Protocol.objects.bulk_update(to_update, update_fields)
            updated = to_update
            print(f"Done")
        except Exception as e:
            print(f"ERROR")
            print(e)
            return HttpResponseServerError("Failed to update protocols")

        try:
            if updated is None:
                updated = []
            protocols = created + updated
            serializer = ProtocolSerializer(protocols, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(e)
            return HttpResponseServerError("Failed to serialize protocols")

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
        try:
            format = "nt"
            fname = slugify(protocol.name)
            print(f"Converting protocol {protocol.id} to rdf...")
            file_data = protocol.to_rdf_string(format)
            print("Done")
            response = HttpResponse(file_data, content_type="application/octet-stream")
            response['Content-Disposition'] = f'attachment;filename="{fname}.{format}"'
            return response
        except Exception as e:
            return HttpResponseServerError(e)

    @action(detail=True)
    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        protocol: Protocol = self.get_object()
        authorize(request, protocol, action="DELETE")
        protocol.delete()
        return HttpResponse(f"Deleted protocol {protocol.id}.")





class SpecializationViewSet(viewsets.ModelViewSet):
    serializer_class = SpecializationSerializer
    queryset = Specialization.objects.all()

    def list(self, request):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        try:
            specializations = PAMLMapping.get_specializations()
            for s in specializations:
                if not any(self.queryset.filter(name=s)):
                    Specialization.objects.create(name=s)

            serializer = self.get_serializer(self.queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(e)
            return HttpResponseServerError("Failed to get specializations")

class ProtocolSpecializationViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolSpecializationSerializer
    queryset = ProtocolSpecialization.objects.all()

    @action(detail=True)
    def specialize(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise NotAuthenticated
        try:
            specialization = Specialization.objects.get(id=kwargs['pk1'])
            protocol: Protocol = Protocol.objects.get(id=kwargs['pk'])
            authorize(request, protocol)

            prior_ps = ProtocolSpecialization.objects.filter(protocol=protocol, specialization=specialization)
            if not any(prior_ps):
                ps = ProtocolSpecialization.objects.create(
                    protocol=protocol,
                    specialization=specialization)
            else:
                ps = prior_ps.first()
            specialization_data = PAMLMapping.specialize(protocol, [specialization], ps)
            ps.data = str(specialization_data[specialization.id])
            ps.save()

            serializer = self.get_serializer(ps, many=False)
            return Response(serializer.data)
        except Exception as e:
            return HttpResponseServerError(e)