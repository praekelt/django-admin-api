from adminapi import tests

model_registry = {
    "Car": tests.Car,
    "Manufacturer": tests.Manufacturer,
    "EngineSize": tests.EngineSize,
}

serializer_registry = {
    "GenericSerializer": tests.serializers.GenericSerializer,
    "CarSerializer": tests.serializers.CarSerializer,
}
