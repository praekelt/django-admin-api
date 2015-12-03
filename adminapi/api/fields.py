from django.db import models

import ckeditor
import fields

def AutoField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "editable": field.editable
    }

def CharField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "max_length": field.max_length,
        "blank": field.blank,
        "choices": field.choices,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def SlugField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "max_length": field.max_length,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def TextField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "max_length": field.max_length,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def EmailField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def DateTimeField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def FileField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def ImageField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def PositiveIntegerField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def IntegerField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def BigIntegerField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def ForeignKey(field):
    return{
        "model_name": field.__class__.__name__,
        "name":field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
        "choices": field.get_choices(),
    }

def ManyToManyField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def OneToOneField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def BooleanField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def RichTextField(field):
    return {
        "model_name": field.__class__.__name__,
        "name": field.name,
        "verbose_name": field.verbose_name,
        "blank": field.blank,
        "help_text": field.help_text,
        "editable": field.editable,
    }

def field_to_dict(field):
    field_data = {
        models.fields.AutoField: fields.AutoField,
        models.fields.CharField: fields.CharField,
        models.fields.TextField: fields.TextField,
        models.fields.SlugField: fields.SlugField,
        models.fields.EmailField: fields.EmailField,
        models.fields.DateTimeField: fields.DateTimeField,
        models.fields.files.ImageField: fields.ImageField,
        models.fields.PositiveIntegerField: fields.PositiveIntegerField,
        models.fields.IntegerField: fields.IntegerField,
        models.fields.BigIntegerField: fields.BigIntegerField,
        models.fields.related.ForeignKey: fields.ForeignKey,
        models.fields.related.ManyToManyField: fields.ManyToManyField,
        models.fields.BooleanField: fields.BooleanField,
        models.fields.related.OneToOneField: fields.OneToOneField,
        ckeditor.fields.RichTextField: fields.RichTextField
    }.get(field.__class__)(field)
    return field_data
