from django.db import models


class TestModel(models.Model):
    test_editable_field = models.CharField(max_length=32)
    test_non_editable_field = models.CharField(max_length=32, editable=False)


class ForeignSingleRelation(models.Model):
    title = models.CharField(max_length=100)

    @property
    def single_relations(self):
        return self.foreignkeytestmodel_set.all()

    def __unicode__(self):
        return self.title


class ForeignKeyTestModel(models.Model):
    title = models.CharField(max_length=100)
    # Many to one relations
    foreign_single_relation = models.ForeignKey(ForeignSingleRelation)

    @property
    def many_relations(self):
        return self.foreignmanyrelation_set.all()

    def __unicode__(self):
        return self.title


class ForeignManyRelation(models.Model):
    title = models.CharField(max_length=100)
    # Many to many relations
    foreign_key_test_models = models.ManyToManyField(ForeignKeyTestModel)

    def __unicode__(self):
        return self.title
