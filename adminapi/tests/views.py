from django.contrib.contenttypes import models
from django.core import exceptions
from django.http import Http404
from django.shortcuts import render_to_response

from rest_framework import viewsets, generics, views
from rest_framework.response import Response
from rest_framework import status

from adminapi import tests
from adminapi.tests import serializers, registry

from rest_framework.exceptions import APIException


class ModelDoesNotExist(APIException):
    status_code = 400
    default_detail = "Model or App does not exist"


class GenericViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        model_name = self.request.resolver_match.kwargs.get("model_name")
        app_name = self.request.resolver_match.kwargs.get("app_name")
        try:
            queryset = models.ContentType.objects.get(
                app_label=app_name,
                model=model_name
            ).model_class().objects.all()
            return queryset
        except (exceptions.ObjectDoesNotExist):
            raise ModelDoesNotExist()

    def get_serializer_class(self):
        model_name = self.request.resolver_match.kwargs.get("model_name")
        app_name = self.request.resolver_match.kwargs.get("app_name")
        serializer = registry.serializer_registry.get(
            model_name,
            tests.serializers.GenericSerializer
        )
        model = None

        try:
            model = models.ContentType.objects.get(
                app_label=app_name,
                model=model_name
            ).model_class()
            serializer.Meta.model = model
            return serializer
        except (exceptions.ObjectDoesNotExist):
            raise ModelDoesNotExist()
