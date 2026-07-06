from rest_framework import serializers
from .models import PreferenceCategory, UserPreference


class PreferenceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenceCategory
        fields = [
            "id", "type", "name", "slug", "description", "icon",
            "is_active", "is_user_submitted", "created_at",
        ]
        read_only_fields = ["id", "slug", "is_user_submitted", "created_at"]


class PreferenceCategoryCreateSerializer(serializers.ModelSerializer):
    """Used when a confused/curious user manually adds their own option,
    e.g. a food not yet in the catalog. Auto-slugified, flagged for review."""

    class Meta:
        model = PreferenceCategory
        fields = ["id", "type", "name", "description", "icon"]

    def create(self, validated_data):
        from django.utils.text import slugify
        request = self.context["request"]
        base_slug = slugify(f'{validated_data["type"]}-{validated_data["name"]}')
        slug, n = base_slug, 1
        while PreferenceCategory.objects.filter(slug=slug).exists():
            n += 1
            slug = f"{base_slug}-{n}"
        return PreferenceCategory.objects.create(
            slug=slug, is_user_submitted=True, created_by=request.user, **validated_data
        )


class UserPreferenceSerializer(serializers.ModelSerializer):
    category_detail = PreferenceCategorySerializer(source="category", read_only=True)

    class Meta:
        model = UserPreference
        fields = ["id", "category", "category_detail", "weight", "notes", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return UserPreference.objects.update_or_create(
            user=validated_data["user"],
            category=validated_data["category"],
            defaults={"weight": validated_data.get("weight", 5), "notes": validated_data.get("notes", "")},
        )[0]
