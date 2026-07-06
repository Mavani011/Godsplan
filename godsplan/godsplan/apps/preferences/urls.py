from rest_framework.routers import DefaultRouter
from .views import PreferenceCategoryViewSet, UserPreferenceViewSet

router = DefaultRouter()
router.register("categories", PreferenceCategoryViewSet, basename="preference-category")
router.register("mine", UserPreferenceViewSet, basename="user-preference")

urlpatterns = router.urls
