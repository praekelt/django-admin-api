from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter

from adminapi import views


router = DefaultRouter()
router.register(r'generic', views.GenericViewSet, base_name='generic')
router.register(r'users', views.UserViewSet, base_name='users')

urlpatterns = patterns(
    '',
    # Single Page App template views(Currently using React)
    url(
        '^login/app/$',
        TemplateView.as_view(template_name='react/login.html'),
        name='app-login'
    ),
    url(
        '^users/app/$',
        TemplateView.as_view(template_name='react/user-admin.html'),
        name='user-admin'
    ),
    # Template urls
    url(
        '^permission-denied/',
        TemplateView.as_view(template_name='error/permission_denied.html'),
        name='permission-denied'
    ),

    # RestFramework views
    url(r'^login/$', views.LoginView.as_view(), name='login'),
    # Used to test React login token auth
    url(r'^test/$', views. TestView.as_view(), name='test'),
    # Rest Router urls
    url(r'^', include(router.urls)),
)
