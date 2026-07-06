from django.contrib import admin
from .models import PreferenceCategory, UserPreference


@admin.register(PreferenceCategory)
class PreferenceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "is_active", "is_user_submitted", "created_by", "created_at")
    list_filter = ("type", "is_active", "is_user_submitted")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    actions = ["approve_selected", "deactivate_selected"]

    @admin.action(description="Approve selected user-submitted options")
    def approve_selected(self, request, queryset):
        queryset.update(is_user_submitted=False, is_active=True)

    @admin.action(description="Deactivate selected options")
    def deactivate_selected(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "category", "weight", "updated_at")
    list_filter = ("category__type",)
    search_fields = ("user__username", "category__name")
