from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter

from adminapi import views


router = DefaultRouter()
router.register(r'generic', views.GenericViewSet, base_name='generic')

urlpatterns = patterns(
    '',
    # Single Page App template views(Currently using React)
    url(
        '^login/app/$',
        TemplateView.as_view(template_name='react/login.html'),
        name='app-login'
       ),
    url(
        '^app/form/$',
        TemplateView.as_view(template_name='react/form.html'),
        name='app-form'
       ),

    # RestFramework views
    url(r'^users/$', views.UserListView.as_view(), name='users'),
    url(r'^login/$', views.LoginView.as_view(), name='login'),
    # Used to test React login token auth
    url(r'^test/$', views. TestView.as_view(), name='test'),

    url(r'^', include(router.urls)),

    url('^edit/$', TemplateView.as_view(template_name='react/react_edit.html'), name='app-edit'),
)
