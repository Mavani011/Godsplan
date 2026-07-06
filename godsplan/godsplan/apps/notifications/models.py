from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    In-app / push notification, e.g. 'This is the best place to visit
    right now' surfaced by the recommendation engine, an order-status
    update, or a review-moderation result.
    """

    class NotificationType(models.TextChoices):
        RECOMMENDATION = "RECOMMENDATION", "Recommendation"
        ORDER_UPDATE = "ORDER_UPDATE", "Order update"
        REVIEW = "REVIEW", "Review activity"
        SYSTEM = "SYSTEM", "System / announcement"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, db_index=True)
    title = models.CharField(max_length=150)
    body = models.CharField(max_length=500)

    # Optional deep-link target, e.g. content_type/object_id of a Place.
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "is_read"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} -> {self.user}"


class NotificationPreference(models.Model):
    """Per-user opt-in/opt-out switches so recommendation pushes stay welcome, not spammy."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference"
    )
    recommendations_enabled = models.BooleanField(default=True)
    order_updates_enabled = models.BooleanField(default=True)
    review_activity_enabled = models.BooleanField(default=True)
    marketing_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"NotificationPreference<{self.user.username}>"
