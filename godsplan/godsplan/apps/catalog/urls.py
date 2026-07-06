from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, FoodItemViewSet, CollegeViewSet, SavedItemViewSet

router = DefaultRouter()
router.register("places", PlaceViewSet, basename="place")
router.register("food-items", FoodItemViewSet, basename="fooditem")
router.register("colleges", CollegeViewSet, basename="college")
router.register("saved-items", SavedItemViewSet, basename="saveditem")

urlpatterns = router.urls
