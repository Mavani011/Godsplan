from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """
    Extends Django's built-in auth.User with GodsPlan-specific fields.
    We keep auth.User for battle-tested password hashing / token auth and
    attach everything domain-specific here (1:1).
    """

    class Gender(models.TextChoices):
        MALE = "M", "Male"
        FEMALE = "F", "Female"
        OTHER = "O", "Other"
        UNSPECIFIED = "U", "Prefer not to say"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    phone_number = models.CharField(max_length=15, blank=True, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, default=Gender.UNSPECIFIED)

    # Home / default location - used when the client doesn't send live GPS.
    city = models.CharField(max_length=100, blank=True, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Free-text budget band - drives the recommendation ranker.
    class BudgetBand(models.TextChoices):
        LOW = "LOW", "Budget-friendly"
        MEDIUM = "MEDIUM", "Mid-range"
        HIGH = "HIGH", "Premium"

    budget_band = models.CharField(max_length=10, choices=BudgetBand.choices, default=BudgetBand.MEDIUM)

    # Study-goal fields used for the college-admission flow.
    is_college_seeker = models.BooleanField(default=False)
    desired_program = models.CharField(max_length=150, blank=True)
    target_city = models.CharField(max_length=100, blank=True)

    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    push_token = models.CharField(max_length=255, blank=True)  # FCM device token

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        return f"Profile<{self.user.username}>"
