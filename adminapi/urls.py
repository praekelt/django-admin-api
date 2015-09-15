from django.conf.urls import patterns, url

from adminapi.views import LoginView, UserListView, TestView


urlpatterns = patterns( '',
    url(r'^users/$', UserListView.as_view(), name='user_list'),
    url(r'^login/$', LoginView.as_view(), name='admin_login'),
    url(r'^test-view/$', TestView.as_view(), name='test_view'),
)
