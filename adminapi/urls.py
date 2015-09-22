from django.conf.urls import patterns, url

from adminapi import views


urlpatterns = patterns(

    "",
    url(r"^users/$", views.UserListView.as_view(), name="user-list"),
    url(r"^login/$", views.LoginView.as_view(), name="login"),
    url(r"^test/$", views.TestView.as_view(), name="test"),

    url(r'^generic/$', views.GenericList.as_view(), name='generic-list'),
    url(r'^generic/(?P<pk>[0-9]+)$', views.GenericView.as_view(), name='generic'),
)
