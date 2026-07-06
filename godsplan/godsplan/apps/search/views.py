from rest_framework import viewsets, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.catalog.models import Place, FoodItem, College
from apps.catalog.serializers import PlaceListSerializer, FoodItemSerializer, CollegeListSerializer
from apps.recommendations.services import annotate_distance

from .models import SearchHistory, RecommendationLog
from .serializers import SearchHistorySerializer, RecommendationLogSerializer


class GlobalSearchView(APIView):
    """
    GET /api/search/?q=khaman&type=FOOD&city=Surat&lat=..&lng=..

    One endpoint that searches food items, places, and colleges by name,
    optionally scoped by type/city, distance-sorted when lat/lng are given.
    Every call is logged to SearchHistory for the analytics/recommendation
    loop described in the product brief ("analyse the data ... give best
    option").
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        search_type = request.query_params.get("type", "GENERAL").upper()
        city = request.query_params.get("city", "")
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")

        results = {"food_items": [], "places": [], "colleges": []}
        total = 0

        if search_type in ("FOOD", "GENERAL") and q:
            items = FoodItem.objects.filter(name__icontains=q, is_available=True).select_related("place")
            if city:
                items = items.filter(place__city__iexact=city)
            results["food_items"] = FoodItemSerializer(items[:25], many=True).data
            total += items.count()

        if search_type in ("PLACE", "GENERAL"):
            places = Place.objects.filter(is_active=True)
            if q:
                places = places.filter(name__icontains=q)
            if city:
                places = places.filter(city__iexact=city)
            if lat and lng:
                places = annotate_distance(places, float(lat), float(lng))
            results["places"] = PlaceListSerializer(places[:25], many=True).data
            total += places.count()

        if search_type in ("COLLEGE", "GENERAL"):
            colleges = College.objects.filter(is_active=True)
            if q:
                colleges = colleges.filter(name__icontains=q)
            if city:
                colleges = colleges.filter(city__iexact=city)
            if lat and lng:
                colleges = annotate_distance(colleges, float(lat), float(lng))
            results["colleges"] = CollegeListSerializer(colleges[:25], many=True).data
            total += colleges.count()

        SearchHistory.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=q, search_type=search_type, city=city,
            latitude=lat or None, longitude=lng or None, result_count=total,
        )

        return Response({"query": q, "result_count": total, **results})


class SearchHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/search/history/ - the logged-in user's own past searches."""

    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)


class RecommendationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/search/recommendation-logs/ - why did GodsPlan suggest this to me?"""

    serializer_class = RecommendationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecommendationLog.objects.filter(user=self.request.user)
