from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer, issue_token


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ - create a user + blank profile, return an auth token."""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": serializer.data, "token": issue_token(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ - exchange username/password for a token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response({"token": issue_token(user), "user_id": user.id, "username": user.username})


class LogoutView(APIView):
    """POST /api/auth/logout/ - invalidate the caller's current token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/me/ - the logged-in user's own profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
