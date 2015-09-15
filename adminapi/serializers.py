from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers, exceptions


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'first_name', 'last_name', 'email',)
        write_only_fields = ('password',)
        read_only_fields = ('is_staff', 'is_superuser', 'is_active', 'date_joined',)

# TODO Currently not used. Remove when closer to devlop merge and still not needed
#class LoginSerializer(serializers.Serializer):
#    username = serializers.CharField()
#    password = serializers.CharField(style={'input_type': 'password'})
#
#    def validate(self, attrs):
#        username = attrs.get('username')
#        password = attrs.get('password')
#
#        if username and password:
#            user = authenticate(username=username, password=password)
#            if user not in User.objects.all():
#                msg = ('Unable to log in with provided credentials.')
#                raise exceptions.ValidationError(msg)
#        else:
#            msg = ('Must include "username" and "password".')
#            raise exceptions.ValidationError(msg)
#
#        attrs['user'] = user
#        return attrs
