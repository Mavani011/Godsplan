from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from .models import Review

# Only these models are reviewable - keeps generic relations from being
# pointed at arbitrary/unsafe tables.
ALLOWED_REVIEW_TARGETS = {"place": "catalog", "fooditem": "catalog", "college": "catalog"}


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    target_type = serializers.ChoiceField(choices=list(ALLOWED_REVIEW_TARGETS.keys()), write_only=True)
    target_id = serializers.IntegerField(write_only=True)
    target_display = serializers.SerializerMethodField(read_only=True)
    quality_score = serializers.FloatField(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "user", "username", "target_type", "target_id", "target_display",
            "rating", "title", "body", "helpful_count", "has_photo", "photo",
            "is_flagged", "is_approved", "quality_score", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "helpful_count", "is_flagged", "created_at", "updated_at"]

    def get_target_display(self, obj):
        return str(obj.target) if obj.target else None

    def validate(self, attrs):
        model_name = attrs["target_type"]
        app_label = ALLOWED_REVIEW_TARGETS[model_name]
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
        except ContentType.DoesNotExist:
            raise serializers.ValidationError("Invalid review target.")
        model_cls = ct.model_class()
        if not model_cls.objects.filter(pk=attrs["target_id"]).exists():
            raise serializers.ValidationError("Target object does not exist.")
        attrs["content_type"] = ct
        attrs["object_id"] = attrs.pop("target_id")
        attrs.pop("target_type")
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["has_photo"] = bool(validated_data.get("photo"))
        return Review.objects.create(**validated_data)
