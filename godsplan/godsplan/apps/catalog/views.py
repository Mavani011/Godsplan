from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response

from .models import Place, FoodItem, College, SavedItem
from .filters import PlaceFilter, CollegeFilter
from .serializers import (
    PlaceListSerializer, PlaceDetailSerializer,
    FoodItemSerializer,
    CollegeListSerializer, CollegeDetailSerializer,
    SavedItemSerializer,
)
from apps.recommendations.services import annotate_distance


class IsVerifiedModeratorOrReadOnly(permissions.BasePermission):
    """Anyone can read; only staff can write. Listings are moderated in /admin/."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class PlaceViewSet(viewsets.ModelViewSet):
    """
    /api/catalog/places/?city=Surat&place_type=RESTAURANT&lat=..&lng=..
    List is distance-sorted when lat/lng query params are supplied so a
    "khaman near me" style query naturally ranks by proximity.
    """

    queryset = Place.objects.filter(is_active=True).prefetch_related("food_items")
    permission_classes = [IsVerifiedModeratorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PlaceFilter
    search_fields = ["name", "description", "address_line", "food_items__name"]
    ordering_fields = ["average_rating", "popularity_score", "price_level", "created_at"]

    def get_serializer_class(self):
        return PlaceDetailSerializer if self.action == "retrieve" else PlaceListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        if lat and lng:
            qs = annotate_distance(qs, float(lat), float(lng))
        return qs


class SavedItemViewSet(viewsets.ModelViewSet):
    """
    /api/catalog/saved-items/  - the logged-in user's bookmarks.
    POST {"target_type": "place"|"college", "target_id": 5} to save.
    DELETE /api/catalog/saved-items/{id}/ to un-save.
    GET /api/catalog/saved-items/toggle/?target_type=place&target_id=5 style
    isn't used - toggling is done client-side: try POST, if it already
    exists (409-ish via unique_together) the client just DELETEs instead.
    Both the Web and App frontends hit this exact endpoint, so a bookmark
    made on one shows up on the other immediately (same Postgres row).
    """

    serializer_class = SavedItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedItem.objects.filter(user=self.request.user).select_related("content_type")

    def create(self, request, *args, **kwargs):
        # Upsert-ish: if this (user, target) is already saved, just return it
        # instead of raising a unique constraint error - keeps the "toggle
        # save" button logic trivial on the frontend.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ct = serializer.validated_data["content_type"]
        object_id = serializer.validated_data["object_id"]
        existing = SavedItem.objects.filter(
            user=request.user, content_type=ct, object_id=object_id
        ).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
        obj = SavedItem.objects.create(user=request.user, content_type=ct, object_id=object_id)
        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)


class FoodItemViewSet(viewsets.ModelViewSet):
    """/api/catalog/food-items/?place=3 or ?search=khaman"""

    queryset = FoodItem.objects.filter(is_available=True).select_related("place", "category")
    serializer_class = FoodItemSerializer
    permission_classes = [IsVerifiedModeratorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["place", "category", "is_vegetarian"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "average_rating", "order_count"]


class CollegeViewSet(viewsets.ModelViewSet):
    """
    /api/catalog/colleges/?city=Surat&program=B.Tech
    Detail view includes nearby hostels/mess/food via `nearby_places`.
    """

    queryset = College.objects.filter(is_active=True).prefetch_related("nearby_places")
    permission_classes = [IsVerifiedModeratorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CollegeFilter
    search_fields = ["name", "programs_offered", "affiliation"]
    ordering_fields = ["average_rating", "popularity_score", "established_year"]

    def get_serializer_class(self):
        return CollegeDetailSerializer if self.action == "retrieve" else CollegeListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        if lat and lng:
            qs = annotate_distance(qs, float(lat), float(lng))
        return qs
