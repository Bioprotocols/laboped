from os import name
from django.urls import path
from django.urls.conf import include
from editor import views
from rest_framework import routers
from django.contrib import admin
from django.contrib.auth import views as auth_views

router = routers.DefaultRouter()
# router.register(r'primitive', views.PrimitiveView)
# router.register(r'protocol', views.ProtocolView)
# router.register(r'rebuild', views.RebuildView, 'rebuild')
urlpatterns = router.urls + [
    path("primitive/", views.PrimitiveView.as_view(), name='api-editor-primitive'),
    path("protocol/", views.ProtocolView.as_view(), name='api-editor-protocol'),
    path("rebuild/", views.rebuild, name='api-editor-rebuild'),
]

# urlpatterns = [
#     # path('admin/', admin.site.urls),
#     path('api/', include(router.urls)),
#     path("", views.home, name="home"),
#     # path("protocol/<protocol_id>", views.protocol, name="protocol"),
#     # path("lib", include(router.urls)),
#     # path("lib/rebuild", views.rebuild_lib),
#     # path("lib/<lib>", views.lib),
#     # path("lib/<lib>/<primitive>", views.lib),
# ]