from django.contrib.auth.models import User

from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework import authentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import viewsets, versioning

from adminapi.api.serializers import UserSerializer, GenericSerializer
from adminapi.api import registry


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
            "detail": "Credentials Validated",
            "token": token.key,
            "username": request.user.username
         })
