from rest_framework import viewsets, generics

from adminapi.tests import models, serializers


class ForeginKeyViewSet(viewsets.ModelViewSet):
    model = models.ForeignKeyTestModel
    queryset = model.objects.all()
    serializer = serializers.ForeignModelSerializer
    serializer.Meta.model = model
    serializer_class = serializer

