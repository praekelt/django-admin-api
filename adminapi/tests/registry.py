from adminapi import tests

serializer_registry = {
    "default": tests.serializers.GenericSerializer,
    "car": tests.serializers.CarSerializer,
}
