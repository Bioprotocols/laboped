import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_POST
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import User

def get_csrf(request):
    response = JsonResponse({'detail': 'CSRF cookie set'})
    response.headers['x-csrftoken'] = get_token(request)
    return response

@require_POST
def signup_view(request):
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')
    user = User.objects.create_user(email, password)
    if email is None or password is None:
        return JsonResponse({'detail': 'Please provide email and password.'}, status=400)
    user = authenticate(email=email, password=password)
    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=400)
    login(request, user)
    return JsonResponse({'detail': 'Successfully logged in.'})

@require_POST
def login_view(request):
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')
    if email is None or password is None:
        return JsonResponse({'detail': 'Please provide email and password.'}, status=400)
    user = authenticate(email=email, password=password)
    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=400)
    login(request, user)
    return JsonResponse({'detail': 'Successfully logged in.'})


def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'You\'re not logged in.'}, status=400)
    logout(request)
    return JsonResponse({'detail': 'Successfully logged out.'})

class SessionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request, format=None):
        return JsonResponse({'isAuthenticated': True})


class WhoAmIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request, format=None):
        return JsonResponse({'email': request.user.email})