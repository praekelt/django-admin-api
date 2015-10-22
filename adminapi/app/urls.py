from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter


urlpatterns = patterns(
    '',
    # Single Page App template views(Currently using React)
    url(
        '^login/$',
        TemplateView.as_view(template_name='react/login.html'),
        name='login'
    ),
    url(
        '^users/$',
        TemplateView.as_view(template_name='react/user-admin.html'),
        name='user-admin'
    ),
    url(
        '^generic/$',
        TemplateView.as_view(template_name='react/genericCRUD.html'),
        name='generic'
    ),
    url(
        '^imagemodel/$',
        TemplateView.as_view(template_name='react/imageModel.html'),
        name='generic'
    ),
    # Template urls
    url(
        '^permission-denied/',
        TemplateView.as_view(template_name='error/permission_denied.html'),
        name='permission-denied'
    ),
)
