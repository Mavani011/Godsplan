from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs["username"]
        password = attrs["password"]
        user = authenticate(username=username, password=password)

        if not user and "@" in username:
            try:
                email_user = User.objects.get(email__iexact=username)
                user = authenticate(username=email_user.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id", "username", "email", "phone_number", "date_of_birth", "gender",
            "city", "latitude", "longitude", "budget_band",
            "is_college_seeker", "desired_program", "target_city",
            "avatar", "push_token", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


def issue_token(user) -> str:
    token, _ = Token.objects.get_or_create(user=user)
    return token.key
