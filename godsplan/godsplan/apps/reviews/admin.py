from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "target", "rating", "is_flagged", "is_approved", "created_at")
    list_filter = ("rating", "is_flagged", "is_approved", "content_type")
    search_fields = ("user__username", "title", "body")
    actions = ["approve_selected", "reject_selected"]

    @admin.action(description="Approve selected reviews")
    def approve_selected(self, request, queryset):
        queryset.update(is_approved=True, is_flagged=False)

    @admin.action(description="Reject (unapprove) selected reviews")
    def reject_selected(self, request, queryset):
        queryset.update(is_approved=False)
