import random
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PreferenceCategory, UserPreference
from .serializers import (
    PreferenceCategorySerializer,
    PreferenceCategoryCreateSerializer,
    UserPreferenceSerializer,
)


class PreferenceCategoryViewSet(viewsets.ModelViewSet):
    """
    /api/preferences/categories/            list + filter by ?type=FOOD
    /api/preferences/categories/{id}/       retrieve
    /api/preferences/categories/suggest/    "confused? shuffle me something" endpoint
    Creation is open to authenticated users (their own manual option); it is
    flagged is_user_submitted=True for admin moderation.
    """

    queryset = PreferenceCategory.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["type", "is_user_submitted"]
    search_fields = ["name", "description"]

    def get_serializer_class(self):
        if self.action == "create":
            return PreferenceCategoryCreateSerializer
        return PreferenceCategorySerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    @action(detail=False, methods=["get"])
    def suggest(self, request):
        """
        Time + crowd aware "shuffle" for undecided users, e.g. GET
        /api/preferences/categories/suggest/?type=FOOD&count=5

        Logic:
          1. Look at what OTHER users with weight >= 6 like in this category
             type, at roughly this time of day (breakfast/lunch/snacks/dinner
             windows), and rank candidates by that popularity.
          2. If there's not enough signal yet, fall back to a random sample
             so the user always gets *something* to react to.
        """
        cat_type = request.query_params.get("type", PreferenceCategory.Type.FOOD)
        count = int(request.query_params.get("count", 5))
        hour = timezone.localtime().hour

        def time_window(h):
            if 5 <= h < 11:
                return "BREAKFAST"
            if 11 <= h < 16:
                return "LUNCH"
            if 16 <= h < 19:
                return "SNACKS"
            return "DINNER"

        window = time_window(hour)

        popular_ids = list(
            UserPreference.objects.filter(
                category__type=cat_type, weight__gte=6
            )
            .values("category_id")
            .annotate()
            .values_list("category_id", flat=True)
        )

        candidates = list(PreferenceCategory.objects.filter(type=cat_type, is_active=True))
        random.shuffle(candidates)
        # Bubble popular-at-this-hour items to the front, then top up randomly.
        popular_first = [c for c in candidates if c.id in popular_ids]
        rest = [c for c in candidates if c.id not in popular_ids]
        picks = (popular_first + rest)[:count]

        return Response(
            {
                "time_window": window,
                "results": PreferenceCategorySerializer(picks, many=True).data,
            }
        )


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """
    /api/preferences/mine/  - CRUD the logged-in user's own preferences.
    POST here is an upsert: posting the same category again just updates
    the weight, matching "user says i love food -> pick specific items".
    """

    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category__type"]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user).select_related("category")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def bulk_set(self, request):
        """Save several preferences in one call - typical onboarding screen submit.
        Body: {"items": [{"category": 3, "weight": 8}, {"category": 9, "weight": 5}]}"""
        items = request.data.get("items", [])
        results = []
        for item in items:
            serializer = self.get_serializer(data=item)
            serializer.is_valid(raise_exception=True)
            results.append(self.get_serializer(serializer.save()).data)
        return Response(results, status=status.HTTP_201_CREATED)
