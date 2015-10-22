from django.db import models
from django.conf import settings


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
    image = models.ImageField(upload_to=settings.MEDIA_ROOT)
