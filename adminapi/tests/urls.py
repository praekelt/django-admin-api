from django.conf.urls import patterns, url, include

from rest_framework.routers import DefaultRouter

from adminapi.tests import views

router = DefaultRouter()
router.register(
    r"generic/(?P<model_name>\w+)",
    views.GenericViewSet,
    base_name="generic"
)

urlpatterns = patterns(
    "",
    url(r"^", include(router.urls)),
    url(r"^adminapi/", include("adminapi.urls")),
)
