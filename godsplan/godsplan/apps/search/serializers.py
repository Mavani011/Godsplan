from rest_framework import serializers
from .models import SearchHistory, RecommendationLog


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = [
            "id", "query", "search_type", "city", "latitude", "longitude",
            "result_count", "created_at",
        ]
        read_only_fields = ["id", "result_count", "created_at"]


class RecommendationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationLog
        fields = [
            "id", "content_type", "object_id", "score", "score_breakdown",
            "reason", "was_clicked", "was_notified", "created_at",
        ]
        read_only_fields = fields
