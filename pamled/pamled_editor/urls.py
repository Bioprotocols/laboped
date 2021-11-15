from django.urls import path
from pamled_editor import views

urlpatterns = [
    path("", views.home, name="home"),
    path("protocol/<protocol_id>", views.protocol, name="protocol"),
    path("lib", views.lib),
    path("lib/<lib>", views.lib),
    path("lib/<lib>/<primitive>", views.lib),
]