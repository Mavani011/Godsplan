from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Review(models.Model):
    """
    A single review. Uses Django's generic relations so the SAME table and
    API can review a Place, a FoodItem, or a College - "an all-in-one
    review system" from the product brief - instead of three near-duplicate
    Review models.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    target = GenericForeignKey("content_type", "object_id")

    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=150, blank=True)
    body = models.TextField(blank=True)

    # simple quality signals used by the ranking service's "review quality" factor
    helpful_count = models.PositiveIntegerField(default=0)
    has_photo = models.BooleanField(default=False)
    photo = models.ImageField(upload_to="review_photos/", null=True, blank=True)

    is_flagged = models.BooleanField(default=False, help_text="reported by users, pending moderation")
    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["rating"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rating}* review by {self.user} on {self.target}"

    @property
    def quality_score(self) -> float:
        """0-1 heuristic: longer, photo-backed, upvoted reviews score higher."""
        length_score = min(len(self.body or "") / 400, 1.0)
        photo_score = 0.2 if self.has_photo else 0
        helpful_score = min(self.helpful_count / 20, 0.3)
        return round(min(length_score * 0.5 + photo_score + helpful_score, 1.0), 3)
