from django.urls import path
from .views import RecommendedPlacesView, RecommendedCollegesView

urlpatterns = [
    path("places/", RecommendedPlacesView.as_view(), name="recommended-places"),
    path("colleges/", RecommendedCollegesView.as_view(), name="recommended-colleges"),
]
