import django
from django.contrib.auth.models import User
from django.contrib.contenttypes import models
from django.core import exceptions, serializers
from django.forms.models import fields_for_model

from rest_framework import viewsets, generics, views
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework import authentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import viewsets, versioning
from rest_framework.exceptions import APIException
from rest_framework import parsers

from adminapi.api.serializers import UserSerializer, GenericSerializer
from adminapi.api import registry, serializers, fields


class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = serializer.data
        del user['password']
        return Response(user)

    def list(self, request):
        serializer = UserSerializer(User.objects.all(), many=True)
        for user in serializer.data:
            del user['password']
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        serializer = UserSerializer(self.get_object())
        user = serializer.data
        del user['password']
        return Response(user)

    def update(self, request, pk=None):
        serializer = UserSerializer(
            self.get_object(),
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = serializer.data
        del user['password']
        return Response(user)


class LoginView(APIView):
    authentication_classes = (authentication.BasicAuthentication,)

    def post(self, request, format=None):
        user = request.user
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "detail": "Credentials validated",
            "token": token.key,
            "username": request.user.username
         })


class ModelDoesNotExist(APIException):
    status_code = 400
    default_detail = "Model or App does not exist"


class GenericViewSet(viewsets.ModelViewSet):
    authentication_classes = (authentication.TokenAuthentication,)

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
            serializers.GenericSerializer
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


class SchemaView(views.APIView):

    def get(self, request, *args, **kwargs):
        model_name = self.request.resolver_match.kwargs.get("model_name")
        app_label = self.request.resolver_match.kwargs.get("app_label")
        model = models.ContentType.objects.get(
                app_label=app_label,
                model=model_name
            ).model_class()
        # import pdb; pdb.set_trace()
        model_field_data = []
        if django.get_version() <= "1.6.8":
            model_field_data = model._meta.many_to_many
            model_field_data.extend(model._meta.fields)
        else:
            model_field_data.extend(model._meta.fields)
        li = []
        for field in model_field_data:
            li.append(fields.field_to_dict(field))
        return Response(li)
