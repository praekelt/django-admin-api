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
    engine_size = EngineSizeSerializer(many=True, read_only=True)

    class Meta:
        model = None
        fields = (
            "id",
            "engine_size",
            "title",
            "manufacturer"
        )


class GenericSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
