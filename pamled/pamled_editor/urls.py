from django.urls import path
from django.urls.conf import include
from pamled_editor import views
from rest_framework import routers
from django.contrib import admin

router = routers.DefaultRouter()
router.register(r'primitives', views.PrimitiveView, 'primitive')


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path("", views.home, name="home"),
    # path("protocol/<protocol_id>", views.protocol, name="protocol"),
    # path("lib", include(router.urls)),
    # path("lib/rebuild", views.rebuild_lib),
    # path("lib/<lib>", views.lib),
    # path("lib/<lib>/<primitive>", views.lib),
]