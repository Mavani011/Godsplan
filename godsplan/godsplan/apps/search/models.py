from django.conf import settings
from django.db import models


class SearchHistory(models.Model):
    """Every search a user runs - fuels 'what do people search near X at time Y' analytics."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="search_history",
        null=True, blank=True,  # allow anonymous search logging
    )
    query = models.CharField(max_length=255, db_index=True)
    search_type = models.CharField(
        max_length=20,
        choices=[("FOOD", "Food"), ("PLACE", "Place"), ("COLLEGE", "College"), ("GENERAL", "General")],
        default="GENERAL",
    )
    city = models.CharField(max_length=100, blank=True, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    result_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["query"]),
            models.Index(fields=["city", "created_at"]),
        ]
        ordering = ["-created_at"]
        verbose_name_plural = "Search histories"

    def __str__(self):
        return f"'{self.query}' by {self.user or 'anon'}"


class RecommendationLog(models.Model):
    """
    Snapshot of what the recommendation engine showed a user and why -
    powers 'suggest via notification: this is the best place' explanations,
    click-through analysis, and future model tuning.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendation_logs"
    )
    content_type = models.CharField(max_length=20, help_text="place / fooditem / college")
    object_id = models.PositiveIntegerField()

    score = models.FloatField(help_text="final ranking score at the time of recommendation")
    score_breakdown = models.JSONField(
        default=dict, help_text="e.g. {preference_match, distance, rating, popularity, time_relevance, review_quality}"
    )
    reason = models.CharField(max_length=255, blank=True, help_text="human-readable reason shown to the user")
    was_clicked = models.BooleanField(default=False)
    was_notified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["content_type", "object_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Rec<{self.content_type}:{self.object_id}> for {self.user} score={self.score:.2f}"
