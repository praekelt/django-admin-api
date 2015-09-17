=========
ADMIN-API
=========
Expose Django's admin as a RESTful service

1. Add "adminapi" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = (
        ...
        'adminapi',
    )
2. Ensure project has DjangoRESTFramework installed and ensure the REST auth token is also included in settings::

    INSTALLED_APPS = (
        ...
        'rest_framework',
        'rest_framework.authtoken',
    )

3. Include the adminapi URLconf in your project urls.py like this::

    url(r'^adminapi/', include('adminapi.urls')),

4. Run `python manage.py migrate` to create the adminapi models.
