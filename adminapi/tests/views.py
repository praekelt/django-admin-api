from rest_framework import viewsets, generics

from adminapi import tests
from adminapi.tests import serializers


class ForeginKeyViewSet(viewsets.ModelViewSet):
    model = tests.ForeignKeyTestModel
    queryset = model.objects.all()
    serializer = serializers.ForeignModelSerializer
    serializer.Meta.model = model
    serializer_class = serializer

