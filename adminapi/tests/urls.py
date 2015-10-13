from django.conf.urls import patterns, url, include

from rest_framework.routers import DefaultRouter

from adminapi.tests import views

router = DefaultRouter()
router.register(
    r'foreign_keys',
    views.ForeignKeyViewSet,
    base_name='foreign-keys'
)

urlpatterns = patterns(
    "",
    url(r'^', include(router.urls)),
    url(r"^adminapi/", include('adminapi.urls')),
)
