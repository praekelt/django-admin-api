from rest_framework import viewsets, generics, views

from adminapi import tests
from adminapi.tests import serializers, registry


class ForeignKeyViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = registry.model_registry[
            self.request.META.get("HTTP_MODEL_CLASS")
        ].objects.all()
        return queryset

    def get_serializer_class(self):
        serializer = registry.serializer_registry[
            self.request.META.get("HTTP_SERIALIZER_CLASS")
        ]
        serializer.Meta.model = registry.model_registry[
            self.request.META.get("HTTP_MODEL_CLASS")
        ]
        return serializer
