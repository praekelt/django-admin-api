from django.conf.urls import patterns, url, include

from rest_framework.routers import DefaultRouter

from adminapi import views


router = DefaultRouter()
router.register(r'generic', views.GenericViewSet)

urlpatterns = patterns(

    "",
    url(r"^users/$", views.UserListView.as_view(), name="user-list"),
    url(r"^login/$", views.LoginView.as_view(), name="login"),
    url(r"^test/$", views.TestView.as_view(), name="test"),

    url(r'^', include(router.urls)),

    url("^edit/$", TemplateView.as_view(template_name="react/react_edit.html"), name="app-edit"),
)
