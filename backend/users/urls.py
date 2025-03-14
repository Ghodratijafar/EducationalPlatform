from django.urls import path
from .views import (
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    CurrentUserView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
] 