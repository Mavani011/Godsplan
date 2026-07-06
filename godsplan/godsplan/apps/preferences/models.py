from django.conf import settings
from django.db import models


class PreferenceCategory(models.Model):
    """
    Admin-curated taxonomy of things a user can express a preference for.
    e.g. type=FOOD -> "Khaman", "Khaus", "Idada" ...
         type=PROGRAM -> "B.Tech CSE", "MBBS", "B.Com" ...
    Keeping this as data (not hardcoded choices) lets ops add new options
    without a deploy, and is what powers the "shuffle / surprise me" and
    "manually add your own choice" flows from the product spec.
    """

    class Type(models.TextChoices):
        FOOD = "FOOD", "Food"
        CUISINE = "CUISINE", "Cuisine"
        PLACE_TYPE = "PLACE_TYPE", "Place type"
        PROGRAM = "PROGRAM", "Study program"
        AMENITY = "AMENITY", "Amenity"
        TIME_OF_DAY = "TIME_OF_DAY", "Time of day"

    type = models.CharField(max_length=20, choices=Type.choices, db_index=True)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=100, blank=True, help_text="icon name/emoji for UI")
    is_active = models.BooleanField(default=True)
    # user-submitted options ("manually add their food") start unapproved
    is_user_submitted = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="submitted_categories",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Preference categories"
        unique_together = ("type", "name")
        indexes = [models.Index(fields=["type", "is_active"])]

    def __str__(self):
        return f"[{self.type}] {self.name}"


class UserPreference(models.Model):
    """
    A single (user, category) preference row with an optional strength/weight
    so 'I love food' can be captured as a strong weight on several FOOD/
    CUISINE categories, while a lukewarm interest gets a lower weight.
    This weight feeds directly into the recommendation ranking service.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences"
    )
    category = models.ForeignKey(
        PreferenceCategory, on_delete=models.CASCADE, related_name="user_preferences"
    )
    weight = models.PositiveSmallIntegerField(
        default=5, help_text="1 (mild interest) - 10 (strong preference)"
    )
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "category")
        indexes = [models.Index(fields=["user", "category"])]

    def __str__(self):
        return f"{self.user} -> {self.category} ({self.weight})"
