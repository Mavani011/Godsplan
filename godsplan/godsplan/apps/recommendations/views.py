from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Place, College
from apps.catalog.serializers import PlaceListSerializer, CollegeListSerializer

from .services import RecommendationService, annotate_distance


class BaseRecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def _context(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        max_distance = request.query_params.get("max_distance_km")
        return (
            float(lat) if lat else None,
            float(lng) if lng else None,
            float(max_distance) if max_distance else None,
        )


class RecommendedPlacesView(BaseRecommendationView):
    """
    GET /api/recommendations/places/?lat=..&lng=..&city=Surat&place_type=RESTAURANT&notify=1

    Personalized, ranked list of places for the current user + context.
    Pass notify=1 to also push a Notification + RecommendationLog for the
    top pick(s) - used right after onboarding or on app open.
    """

    def get(self, request):
        lat, lng, max_distance = self._context(request)
        qs = Place.objects.filter(is_active=True)

        city = request.query_params.get("city")
        place_type = request.query_params.get("place_type")
        if city:
            qs = qs.filter(city__iexact=city)
        if place_type:
            qs = qs.filter(place_type=place_type)
        if lat and lng:
            qs = annotate_distance(qs, lat, lng)

        service = RecommendationService(request.user, lat=lat, lng=lng, max_distance_km=max_distance)
        ranked = service.rank_places(qs, limit=int(request.query_params.get("limit", 20)))

        notify_top_n = int(request.query_params.get("notify", 0))
        if notify_top_n:
            service.log(ranked, notify_top_n=notify_top_n)

        return Response(
            {
                "time_window": service.time_window,
                "results": [
                    {
                        **PlaceListSerializer(item.obj).data,
                        "score": item.score,
                        "score_breakdown": item.breakdown,
                        "reason": item.reason,
                    }
                    for item in ranked
                ],
            }
        )


class RecommendedCollegesView(BaseRecommendationView):
    """GET /api/recommendations/colleges/?lat=..&lng=..&city=Surat - ranked by program match, rating, distance."""

    def get(self, request):
        lat, lng, max_distance = self._context(request)
        qs = College.objects.filter(is_active=True)

        city = request.query_params.get("city")
        if city:
            qs = qs.filter(city__iexact=city)
        if lat and lng:
            qs = annotate_distance(qs, lat, lng)

        service = RecommendationService(request.user, lat=lat, lng=lng, max_distance_km=max_distance)
        ranked = service.rank_colleges(qs, limit=int(request.query_params.get("limit", 20)))

        return Response(
            {
                "results": [
                    {
                        **CollegeListSerializer(item.obj).data,
                        "score": item.score,
                        "score_breakdown": item.breakdown,
                        "reason": item.reason,
                    }
                    for item in ranked
                ]
            }
        )
