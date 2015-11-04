=========
ADMIN-API
=========
Expose Django's admin as a RESTful service

1. Add "adminapi" to your project INSTALLED_APPS in settings.py::

    INSTALLED_APPS = (
        ...
        'adminapi',
        'adminapi.app',
    )

2. Ensure project has DjangoRESTFramework installed and ensure the REST auth token is also included in settings::

    INSTALLED_APPS = (
        ...
        'rest_framework',
        'rest_framework.authtoken',
    )

3. Include the adminapi URLconf in your project urls.py::

    url(r'^adminapi/', include('adminapi.urls')),

4. Run `python manage.py migrate` to create the adminapi models.

adminapi URLs
-------------

API urls and purpose:

+---------------------------------------------------+-----------------------------------------------------------+
| url                                               | purpose                                                   |
+===================================================+===========================================================+
| v1/login/                                         | URL to be hit with a post request with a Basic Auth header|
|                                                   | returns a auth token to be saved and used to authenticate |
|                                                   | access to other api views                                 |
+---------------------------------------------------+-----------------------------------------------------------+
| v1/generic/<app_label>/<model_name>               | API view obtains model instance via url params,           |
|                                                   | this allows Create, Update and Delete to be called        |
|                                                   | on the model instance.                                    |
|                                                   | POST used for create, PUT used for update,                |
|                                                   | DELETE used for delete                                    |
+---------------------------------------------------+-----------------------------------------------------------+
| v1/(?P<app_label>\w+)/(?P<model_name>\w+)/schema/ | API view obtains model instance via url params and returns|
|                                                   | a JSON representation of the model fields                 |
+---------------------------------------------------+-----------------------------------------------------------+



APP urls, these can be replaced with any front end app of choice. Currently it uses a React front end

+-----------------------+---------------------------+-------------------------------------------------------------------+
| url                   | template                  | purpose                                                           |
+=======================+===========================+===================================================================+
| login/                | login.html                | opens react form to authenticate user and                         |
|                       |                           | return a auth token to be used to access                          |
|                       |                           | the api views                                                     |
+-----------------------+---------------------------+-------------------------------------------------------------------+
| admin/                | admin.html                | opens react page that automatically creates a form based on the   |
|                       |                           | model that is passed to the api schema url, also populates a list |
|                       |                           | containing all the created objects of the model type              |
+-----------------------+---------------------------+-------------------------------------------------------------------+
| premission-denied/    | permission-denied.html    | simple redirection template that redirects to the login screen    |
|                       |                           | if the current user does not have access to the api views         |
|                       |                           | the app is currently trying to access. Called by the app if auth  |
|                       |                           | fails on view                                                     |
+-----------------------+---------------------------+-------------------------------------------------------------------+
