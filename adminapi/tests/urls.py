from django.conf.urls import patterns, url, include

from rest_framework.routers import DefaultRouter

from adminapi.tests import views

router = DefaultRouter()
router.register(
    r"test-generic/(?P<app_name>\w+)/(?P<model_name>\w+)",
    views.GenericViewSet,
    base_name="test-generic"
)
router.register(
    r"test-image/(?P<app_name>\w+)/(?P<model_name>\w+)",
    views.GenericViewSet,
    base_name="test-image"
)

urlpatterns = patterns(
    "",
    url(r"^", include(router.urls)),
    url(r"^adminapi/", include("adminapi.urls")),
)
