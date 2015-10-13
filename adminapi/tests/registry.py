from adminapi import tests

model_registry = {
    "ForeignKeyTestModel": tests.ForeignKeyTestModel,
    "ForeignSingleRelation": tests.ForeignSingleRelation,
    "ForeignManyRelation": tests.ForeignManyRelation,
}

serializer_registry = {
    "GenericSerializer": tests.serializers.GenericSerializer,
    "ForeignModelSerializer": tests.serializers.ForeignModelSerializer,
}
