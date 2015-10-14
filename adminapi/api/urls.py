from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter

from adminapi.api import views


router = DefaultRouter()
router.register(r'users', views.UserViewSet, base_name='users')
router.register(
    r"generic/(?P<app_name>\w+)/(?P<model_name>\w+)",
    views.GenericViewSet,
    base_name="generic"
)

urlpatterns = patterns(
    '',
    # RestFramework views
    url(r'^v1/login/$', views.LoginView.as_view(), name='login'),
    # Rest Router urls
    url(r'^v1/', include(router.urls)),
)
