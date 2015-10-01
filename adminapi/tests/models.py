from django.db import models


class TestModel(models.Model):
    test_editable_field = models.CharField(max_length=32)
    test_non_editable_field = models.CharField(max_length=32, editable=False)
