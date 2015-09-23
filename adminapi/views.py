from django.contrib.auth.models import User

from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import viewsets

from adminapi.serializers import UserSerializer, GenericSerializer
from adminapi.tests.models import TestModel
from adminapi import registry


class UserListView(generics.ListAPIView):
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all()
    serializer_class = UserSerializer


class LoginView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        user = request.user
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "detail": "Credentials Validated",
            "token": token.key,
            "username": request.user.username
         })


class TestView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        return Response({"detail": "Auth Token Valid"})


class GenericViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    model = registry.model_registry[request.META.get('HTTP_CLASS')]
    queryset = model.objects.all()
    serializer = GenericSerializer
    serializer.Meta.model = model
    serializer_class = serializer
