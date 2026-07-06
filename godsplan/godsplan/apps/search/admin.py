from django.contrib import admin
from .models import SearchHistory, RecommendationLog


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ("query", "user", "search_type", "city", "result_count", "created_at")
    list_filter = ("search_type", "city")
    search_fields = ("query", "user__username", "city")
    date_hierarchy = "created_at"


@admin.register(RecommendationLog)
class RecommendationLogAdmin(admin.ModelAdmin):
    list_display = ("user", "content_type", "object_id", "score", "was_clicked", "was_notified", "created_at")
    list_filter = ("content_type", "was_clicked", "was_notified")
    search_fields = ("user__username", "reason")
    date_hierarchy = "created_at"
