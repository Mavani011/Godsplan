"""
Recommendation ranking service.

This module is the single place that turns "a user + their context" into a
ranked list of Places / FoodItems / Colleges. It is intentionally framework
-light (plain Python + Django ORM annotations) so it can later be swapped
for a real ML model without touching the views that call it.

Ranking factors (as required by the product spec), each normalized to 0-1
then combined with tunable weights:

    preference_match   - overlap between the item's category/type and the
                          user's UserPreference weights
    proximity           - closer is better, decays with distance
    rating              - the item's average_rating
    popularity          - popularity_score / order_count relative to peers
    time_relevance      - does this item fit the current time-of-day window
                          (e.g. breakfast items score higher at 8am)
    review_quality      - aggregate Review.quality_score for the item
"""
from dataclasses import dataclass, field
from decimal import Decimal
from math import radians, sin, cos, sqrt, atan2

from django.db.models import QuerySet, F, FloatField, ExpressionWrapper, Value
from django.db.models.functions import ACos, Cos, Sin, Radians, Least
from django.utils import timezone

EARTH_RADIUS_KM = 6371.0

# Tunable weights - sum doesn't need to equal 1, but keeping it close to 1
# makes the final score intuitively read like a 0-1 confidence.
WEIGHTS = {
    "preference_match": 0.30,
    "proximity": 0.20,
    "rating": 0.20,
    "popularity": 0.10,
    "time_relevance": 0.10,
    "review_quality": 0.10,
}

TIME_WINDOWS = {
    "BREAKFAST": (5, 11),
    "LUNCH": (11, 16),
    "SNACKS": (16, 19),
    "DINNER": (19, 24),
}


def current_time_window(now=None) -> str:
    hour = (now or timezone.localtime()).hour
    for label, (start, end) in TIME_WINDOWS.items():
        if start <= hour < end:
            return label
    return "LATE_NIGHT"


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Pure-Python distance fallback (used for small in-memory result sets)."""
    lat1, lon1, lat2, lon2 = map(lambda v: radians(float(v)), [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return EARTH_RADIUS_KM * 2 * atan2(sqrt(a), sqrt(1 - a))


def annotate_distance(queryset: QuerySet, lat: float, lng: float) -> QuerySet:
    """
    Annotate a Place/College queryset with `distance_km` computed in SQL via
    the spherical law of cosines, then order by it. Works on plain
    PostgreSQL (no PostGIS extension required).
    """
    lat_rad = radians(lat)
    lng_rad = radians(lng)
    distance_expr = ExpressionWrapper(
        EARTH_RADIUS_KM
        * ACos(
            Least(
                Value(1.0),
                (
                    Sin(Value(lat_rad)) * Sin(Radians(F("latitude")))
                    + Cos(Value(lat_rad)) * Cos(Radians(F("latitude")))
                    * Cos(Radians(F("longitude")) - Value(lng_rad))
                ),
            )
        ),
        output_field=FloatField(),
    )
    return queryset.annotate(distance_km=distance_expr).order_by("distance_km")


def _normalize(value, max_value) -> float:
    if not max_value:
        return 0.0
    return max(0.0, min(float(value) / float(max_value), 1.0))


@dataclass
class ScoredItem:
    obj: object
    content_type: str
    score: float
    breakdown: dict = field(default_factory=dict)
    reason: str = ""


class RecommendationService:
    """
    Usage:
        service = RecommendationService(user, lat=21.17, lng=72.83)
        ranked = service.rank_places(place_queryset)
    """

    def __init__(self, user, lat=None, lng=None, max_distance_km=None):
        self.user = user
        self.lat = lat
        self.lng = lng
        self.max_distance_km = max_distance_km
        self.time_window = current_time_window()
        self._pref_weights_by_category_id = self._load_preferences()

    def _load_preferences(self) -> dict:
        if not self.user or not getattr(self.user, "is_authenticated", False):
            return {}
        from apps.preferences.models import UserPreference
        return dict(
            UserPreference.objects.filter(user=self.user).values_list("category_id", "weight")
        )

    # -- individual factor scorers -----------------------------------------

    def _preference_match_score(self, category_ids) -> float:
        if not self._pref_weights_by_category_id or not category_ids:
            return 0.3  # neutral score when we have no signal yet
        weights = [self._pref_weights_by_category_id.get(cid, 0) for cid in category_ids]
        weights = [w for w in weights if w]
        if not weights:
            return 0.15
        return _normalize(max(weights), 10)

    def _proximity_score(self, distance_km) -> float:
        if distance_km is None:
            return 0.5  # unknown location - stay neutral, don't penalize
        radius = self.max_distance_km or 15.0
        if distance_km >= radius:
            return 0.0
        return round(1.0 - (distance_km / radius), 3)

    def _rating_score(self, average_rating) -> float:
        return _normalize(average_rating, 5)

    def _popularity_score(self, popularity, peer_max) -> float:
        return _normalize(popularity, peer_max or 1)

    def _time_relevance_score(self, item_time_windows) -> float:
        if not item_time_windows:
            return 0.5
        return 1.0 if self.time_window in item_time_windows else 0.3

    def _review_quality_score(self, content_type, object_id) -> float:
        from apps.reviews.models import Review
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.filter(app_label="catalog", model=content_type).first()
        if not ct:
            return 0.3
        scores = [
            r.quality_score
            for r in Review.objects.filter(content_type=ct, object_id=object_id, is_approved=True)[:20]
        ]
        return sum(scores) / len(scores) if scores else 0.3

    # -- public ranking entrypoints ------------------------------------------

    def score_place(self, place) -> ScoredItem:
        category_ids = list(place.food_items.values_list("category_id", flat=True)) if hasattr(place, "food_items") else []
        distance_km = getattr(place, "distance_km", None)
        peer_max_popularity = getattr(place, "_peer_max_popularity", 1000)

        breakdown = {
            "preference_match": self._preference_match_score(category_ids),
            "proximity": self._proximity_score(distance_km),
            "rating": self._rating_score(place.average_rating),
            "popularity": self._popularity_score(place.popularity_score, peer_max_popularity),
            "time_relevance": self._time_relevance_score(self._infer_time_windows(place)),
            "review_quality": self._review_quality_score("place", place.pk),
        }
        total = sum(WEIGHTS[k] * v for k, v in breakdown.items())
        reason = self._build_reason(breakdown, distance_km)
        return ScoredItem(obj=place, content_type="place", score=round(total, 4), breakdown=breakdown, reason=reason)

    def score_college(self, college) -> ScoredItem:
        distance_km = getattr(college, "distance_km", None)
        peer_max_popularity = getattr(college, "_peer_max_popularity", 1000)
        breakdown = {
            "preference_match": self._college_program_match_score(college),
            "proximity": self._proximity_score(distance_km),
            "rating": self._rating_score(college.average_rating),
            "popularity": self._popularity_score(college.popularity_score, peer_max_popularity),
            "time_relevance": 0.5,  # not time-sensitive
            "review_quality": self._review_quality_score("college", college.pk),
        }
        total = sum(WEIGHTS[k] * v for k, v in breakdown.items())
        reason = self._build_reason(breakdown, distance_km)
        return ScoredItem(obj=college, content_type="college", score=round(total, 4), breakdown=breakdown, reason=reason)

    def _college_program_match_score(self, college) -> float:
        profile = getattr(self.user, "profile", None)
        if not profile or not profile.desired_program:
            return 0.3
        wanted = profile.desired_program.strip().lower()
        programs = [p.lower() for p in (college.programs_offered or [])]
        return 1.0 if any(wanted in p or p in wanted for p in programs) else 0.1

    def _infer_time_windows(self, place):
        mapping = {
            "RESTAURANT": {"BREAKFAST", "LUNCH", "DINNER"},
            "CAFE": {"BREAKFAST", "SNACKS"},
            "STREET_FOOD": {"SNACKS", "DINNER"},
        }
        return mapping.get(place.place_type)

    def _build_reason(self, breakdown, distance_km) -> str:
        top_factor = max(breakdown, key=breakdown.get)
        readable = {
            "preference_match": "matches what you like",
            "proximity": f"only {distance_km:.1f} km away" if distance_km is not None else "nearby",
            "rating": "highly rated",
            "popularity": "trending right now",
            "time_relevance": f"great choice for {self.time_window.lower()}",
            "review_quality": "backed by detailed reviews",
        }
        return readable.get(top_factor, "recommended for you")

    def rank_places(self, queryset, limit=20):
        items = list(queryset[:200])  # cap candidate pool before scoring
        peer_max = max((p.popularity_score for p in items), default=1)
        for p in items:
            p._peer_max_popularity = peer_max
        scored = [self.score_place(p) for p in items]
        scored.sort(key=lambda s: s.score, reverse=True)
        return scored[:limit]

    def rank_colleges(self, queryset, limit=20):
        items = list(queryset[:200])
        peer_max = max((c.popularity_score for c in items), default=1)
        for c in items:
            c._peer_max_popularity = peer_max
        scored = [self.score_college(c) for c in items]
        scored.sort(key=lambda s: s.score, reverse=True)
        return scored[:limit]

    def log(self, scored_items, notify_top_n=0):
        """Persist RecommendationLog rows and optionally push a Notification
        for the top-N results (the 'best place to visit' push)."""
        from apps.search.models import RecommendationLog
        from apps.notifications.models import Notification, NotificationPreference

        if not self.user or not getattr(self.user, "is_authenticated", False):
            return

        logs = []
        for i, item in enumerate(scored_items):
            logs.append(
                RecommendationLog(
                    user=self.user,
                    content_type=item.content_type,
                    object_id=item.obj.pk,
                    score=item.score,
                    score_breakdown=item.breakdown,
                    reason=item.reason,
                    was_notified=i < notify_top_n,
                )
            )
        RecommendationLog.objects.bulk_create(logs)

        if notify_top_n:
            pref, _ = NotificationPreference.objects.get_or_create(user=self.user)
            if pref.recommendations_enabled:
                for item in scored_items[:notify_top_n]:
                    Notification.objects.create(
                        user=self.user,
                        notification_type=Notification.NotificationType.RECOMMENDATION,
                        title=f"Top pick: {item.obj.name}",
                        body=f"{item.obj.name} is {item.reason}. Worth a visit!",
                        related_object_type=item.content_type,
                        related_object_id=item.obj.pk,
                    )
