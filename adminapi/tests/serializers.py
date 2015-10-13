from rest_framework import serializers

from adminapi.tests import models


class ManyRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ForeignManyRelation
        fields = (
            "title",
        )


class ForeignModelSerializer(serializers.ModelSerializer):
    many_relation = ManyRelationSerializer(many=True, read_only=True)
    class Meta:
        model = None
        fields = (
            "id",
            "many_relation",
            "title",
            "foreign_single_relation"
        )
