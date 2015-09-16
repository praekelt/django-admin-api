from django.conf.urls import patterns, url

from adminapi.views import LoginView, UserListView, TestView


urlpatterns = patterns(

    '',
    url(r'^users/$', UserListView.as_view(), name='user_list'),
    url(r'^login-auth/$', LoginView.as_view(), name='admin_login_auth'),
    url(r'^test-view/$', TestView.as_view(), name='test_view'),
)
