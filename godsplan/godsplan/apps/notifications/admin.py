from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "notification_type", "is_read", "created_at")
    list_filter = ("notification_type", "is_read")
    search_fields = ("title", "body", "user__username")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "recommendations_enabled", "order_updates_enabled", "marketing_enabled")
