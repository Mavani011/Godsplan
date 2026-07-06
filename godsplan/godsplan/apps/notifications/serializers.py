from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "title", "body",
            "related_object_type", "related_object_id", "is_read", "created_at",
        ]
        read_only_fields = fields


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "recommendations_enabled", "order_updates_enabled",
            "review_activity_enabled", "marketing_enabled",
            "quiet_hours_start", "quiet_hours_end",
        ]
