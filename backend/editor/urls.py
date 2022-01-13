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
    path("primitive/", views.PrimitiveViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='api-editor-primitive'),
    path("primitive/rebuild/", views.PrimitiveViewSet.as_view({
        'get': 'rebuild'
    }), name='api-editor-primitive-rebuild'),
    path("protocol/", views.ProtocolViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='api-editor-protocol-list'),
    path('protocol/<int:pk>/download/', views.ProtocolViewSet.as_view({
        'get': 'download'
    }), name='api-editor-protocol-download'),
    path('protocol/<int:pk>/download/', views.ProtocolViewSet.as_view({
        'get': 'download'
    }), name='api-editor-protocol-download'),
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