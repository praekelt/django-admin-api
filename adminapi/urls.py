from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView


urlpatterns = patterns('',
    ('^login/$', TemplateView.as_view(template_name='react/ReactLogin.html')),
)
