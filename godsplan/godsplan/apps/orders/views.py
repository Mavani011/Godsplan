from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import OrderRequest
from .serializers import OrderRequestSerializer


class OrderRequestViewSet(viewsets.ModelViewSet):
    """
    /api/orders/            - place & list your own orders (in-app, no redirect)
    /api/orders/{id}/       - retrieve/cancel
    Staff (place owners/admins) can update status via the admin panel or a
    future partner dashboard; PATCH here is restricted to the owning user
    for cancellation only.
    """

    serializer_class = OrderRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderRequest.objects.all().select_related("place", "food_item")
        return OrderRequest.objects.filter(user=user).select_related("place", "food_item")

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=403)
        if order.status in (OrderRequest.Status.COMPLETED, OrderRequest.Status.CANCELLED):
            return Response({"detail": "Order can no longer be cancelled."}, status=400)
        order.status = OrderRequest.Status.CANCELLED
        order.save(update_fields=["status"])
        return Response(self.get_serializer(order).data)
