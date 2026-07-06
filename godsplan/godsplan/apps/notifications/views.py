from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/notifications/            - the logged-in user's inbox (newest first)
    /api/notifications/{id}/mark_read/
    /api/notifications/mark_all_read/
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response(self.get_serializer(notif).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"marked_read": updated})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/notifications/preferences/me/"""

    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        pref, _ = NotificationPreference.objects.get_or_create(user=self.request.user)
        return pref
