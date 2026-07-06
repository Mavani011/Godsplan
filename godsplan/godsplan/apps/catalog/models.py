from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Place(TimeStampedModel):
    """
    A physical location: restaurant, cafe, tourist spot, PG/hostel, mess,
    or any local-search entity. FoodItems and College hostels/mess both
    point back to a Place, keeping location + address data normalized in
    one table instead of duplicated everywhere.
    """

    class PlaceType(models.TextChoices):
        RESTAURANT = "RESTAURANT", "Restaurant"
        CAFE = "CAFE", "Cafe"
        STREET_FOOD = "STREET_FOOD", "Street food stall"
        TOURIST_SPOT = "TOURIST_SPOT", "Tourist spot"
        HOSTEL = "HOSTEL", "Hostel"
        PG = "PG", "PG / paying-guest accommodation"
        MESS = "MESS", "Mess / tiffin service"
        OTHER = "OTHER", "Other"

    name = models.CharField(max_length=200, db_index=True)
    place_type = models.CharField(max_length=20, choices=PlaceType.choices, db_index=True)
    description = models.TextField(blank=True)

    address_line = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Optional link when this place (hostel/mess/PG) serves a specific college.
    near_college = models.ForeignKey(
        "catalog.College", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="nearby_places",
    )

    price_level = models.PositiveSmallIntegerField(
        default=2, validators=[MinValueValidator(1), MaxValueValidator(4)],
        help_text="1=cheap .. 4=premium, roughly matches budget_band",
    )
    average_cost_for_two = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Denormalized aggregates, refreshed by a signal/task when reviews change.
    # Kept here (rather than always recomputed) so ranking queries stay cheap.
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    popularity_score = models.PositiveIntegerField(
        default=0, help_text="rolling count of views/searches/orders, feeds ranking"
    )

    opens_at = models.TimeField(null=True, blank=True)
    closes_at = models.TimeField(null=True, blank=True)
    is_open_24h = models.BooleanField(default=False)

    phone_number = models.CharField(max_length=15, blank=True)
    cover_image = models.ImageField(upload_to="places/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False, help_text="admin-verified listing")

    class Meta:
        indexes = [
            models.Index(fields=["city", "place_type"]),
            models.Index(fields=["latitude", "longitude"]),
            models.Index(fields=["average_rating"]),
            models.Index(fields=["popularity_score"]),
        ]
        ordering = ["-popularity_score"]

    def __str__(self):
        return f"{self.name} ({self.city})"


class FoodItem(TimeStampedModel):
    """
    A single menu item served at a Place. This is what powers the
    'khaman near me, same price, order inside GodsPlan' flow - we store
    our own price/availability rather than deep-linking to a third-party
    aggregator.
    """

    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="food_items")
    category = models.ForeignKey(
        "preferences.PreferenceCategory", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="food_items", limit_choices_to={"type": "FOOD"},
    )
    name = models.CharField(max_length=150, db_index=True)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_vegetarian = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to="food/", null=True, blank=True)

    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    order_count = models.PositiveIntegerField(default=0, help_text="feeds popularity ranking")

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["place", "is_available"]),
        ]

    def __str__(self):
        return f"{self.name} @ {self.place.name}"


class College(TimeStampedModel):
    """
    College/institute entity for the admissions-guidance flow: program
    search, hostel/mess/food nearby (via Place.near_college), fest info,
    and ranking.
    """

    name = models.CharField(max_length=200, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    programs_offered = models.JSONField(
        default=list, help_text='e.g. ["B.Tech CSE", "B.Tech Mechanical", "MBA"]'
    )
    affiliation = models.CharField(max_length=150, blank=True, help_text="e.g. GTU, AICTE")
    established_year = models.PositiveIntegerField(null=True, blank=True)

    admission_process = models.TextField(blank=True)
    fees_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fees_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    has_hostel = models.BooleanField(default=False)
    has_mess = models.BooleanField(default=False)
    fest_name = models.CharField(max_length=150, blank=True)
    fest_month = models.CharField(max_length=20, blank=True)

    website = models.URLField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    logo = models.ImageField(upload_to="colleges/", null=True, blank=True)

    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    popularity_score = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["average_rating"]),
        ]
        ordering = ["-popularity_score"]

    def __str__(self):
        return f"{self.name} ({self.city})"


class SavedItem(TimeStampedModel):
    """
    A user's bookmark on a Place or College - the "saved plans" / heart-icon
    feature shared by both the Web and App frontends. Generic relation (same
    pattern as apps.reviews.Review) so one table covers both target types.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_items")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    target = GenericForeignKey("content_type", "object_id")

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        indexes = [models.Index(fields=["user", "content_type", "object_id"])]

    def __str__(self):
        return f"{self.user} saved {self.target}"
