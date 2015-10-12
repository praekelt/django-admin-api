from django.conf.urls import patterns, url, include


urlpatterns = patterns(
    '',
    url(r'^app/', include('adminapi.app.urls', namespace='app')),
    url(r'^api/', include('adminapi.api.urls', namespace='api')),
)
