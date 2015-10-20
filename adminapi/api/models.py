import os

from django.db import models

RES_DIR = os.path.join(os.path.dirname(__file__+"../tests/"), "res")


class Manufacturer(models.Model):
    title = models.CharField(max_length=100)


class Car(models.Model):
    title = models.CharField(max_length=100)
    # Many to one relations
    manufacturer = models.ForeignKey(Manufacturer)


class EngineSize(models.Model):
    title = models.CharField(max_length=100)
    # Many to many relations
    car = models.ManyToManyField(
        Car,
        related_name="engine_size"
    )

class ImageModel(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to=RES_DIR)

