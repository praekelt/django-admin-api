import logging

from django.db import models

from adminapi.tests import models
'''
logging.basicConfig(filename='models.log',level=logging.DEBUG)
model_registry = models.get_models(include_auto_created=True)
logging.debug(model_registry)
'''

model_registry = {
    'TestModel': models.TestModel,
    }

