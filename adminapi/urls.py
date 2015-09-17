from django.conf.urls import patterns, url

from adminapi.views import LoginView, UserListView, TestView


urlpatterns = patterns(

    "",
    url(r"^users/$", UserListView.as_view(), name="user-list"),
    url(r"^login-auth/$", LoginView.as_view(), name="admin-login-auth"),
    url(r"^test-view/$", TestView.as_view(), name="test-view"),
)
