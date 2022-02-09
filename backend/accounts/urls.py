from django.urls import path

from . import views

urlpatterns = [
    path('csrf/', views.get_csrf, name='api-accounts-csrf'),
    path('signup/', views.signup_view, name='api-accounts-signup'),
    path('login/', views.login_view, name='api-accounts-login'),
    path('logout/', views.logout_view, name='api-accounts-logout'),
    path('session/', views.SessionView.as_view(), name='api-accounts-session'),
    path('whoami/', views.WhoAmIView.as_view(), name='api-accounts-whoami'),
]