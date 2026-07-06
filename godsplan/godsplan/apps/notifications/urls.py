from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import NotificationViewSet, NotificationPreferenceView

router = DefaultRouter()
router.register("", NotificationViewSet, basename="notification")

urlpatterns = [
    path("preferences/me/", NotificationPreferenceView.as_view(), name="notification-preferences"),
    path("", include(router.urls)),
]
