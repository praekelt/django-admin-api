from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from adminapi.views import LoginView, UserListView, TestView


urlpatterns = patterns(
    "",
    # SPA template views
    url("^login/app/$", TemplateView.as_view(template_name="react/react_login.html"), name="app-login"),

    # RestFramework views
    url(r"^users/$", UserListView.as_view(), name="users"),
    url(r"^login/$", LoginView.as_view(), name="login"),
    # Used to test React login token auth
    url(r"^test/$", TestView.as_view(), name="test"),
)
