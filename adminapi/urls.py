from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from adminapi.views import LoginView, UserListView, TestView


urlpatterns = patterns(
    "",
    # SPA template views
    url("^login/$", TemplateView.as_view(template_name="react/ReactLogin.html")),

    # RestFramework views
    url(r"^users/$", UserListView.as_view(), name="user-list"),
    url(r"^login-auth/$", LoginView.as_view(), name="admin-login-auth"),
    url(r"^test-view/$", TestView.as_view(), name="test-view"),
)
