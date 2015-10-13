from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter

from adminapi.api import views


router = DefaultRouter()
router.register(r'users', views.UserViewSet, base_name='users')

urlpatterns = patterns(
    '',
    # RestFramework views
    url(r'^v1/login/$', views.LoginView.as_view(), name='login'),
    # Rest Router urls
    url(r'^v1/', include(router.urls)),
)
