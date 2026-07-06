from django.urls import path
from .views import RegisterView, LoginView, LogoutView, MyProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("profile/me/", MyProfileView.as_view(), name="auth-profile-me"),
]
