from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import GlobalSearchView, SearchHistoryViewSet, RecommendationLogViewSet

router = DefaultRouter()
router.register("history", SearchHistoryViewSet, basename="search-history")
router.register("recommendation-logs", RecommendationLogViewSet, basename="recommendation-log")

urlpatterns = [
    path("", GlobalSearchView.as_view(), name="global-search"),
    path("", include(router.urls)),
]
