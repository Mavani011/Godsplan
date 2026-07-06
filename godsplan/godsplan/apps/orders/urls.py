from rest_framework.routers import DefaultRouter
from .views import OrderRequestViewSet

router = DefaultRouter()
router.register("", OrderRequestViewSet, basename="order")

urlpatterns = router.urls
