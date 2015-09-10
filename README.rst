=========
ADMIN-API
=========

1. Add "admin_api" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = (
        ...
        'admin_api',
    )

2. Include the admin_api URLconf in your project urls.py like this::

    url(r'^admin_api/', include('admin_api.urls')),

3. Run `python manage.py migrate` to create the admin_api models.
