from rest_framework import serializers

from adminapi import tests


class ManyRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = tests.ForeignManyRelation
        fields = (
            "id",
            "title"
        )


class ForeignModelSerializer(serializers.ModelSerializer):
    foreign_many_relation = ManyRelationSerializer(many=True, read_only=True)

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
