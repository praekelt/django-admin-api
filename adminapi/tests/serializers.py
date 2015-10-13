from rest_framework import serializers

from adminapi import tests


class EngineSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = tests.EngineSize
        fields = (
            "id",
            "title"
        )


class CarSerializer(serializers.ModelSerializer):
    foreign_many_relation = EngineSizeSerializer(many=True, read_only=True)

    class Meta:
        model = None
        fields = (
            "id",
            "foreign_many_relation",
            "title",
            "foreign_single_relation"
        )


class GenericSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
