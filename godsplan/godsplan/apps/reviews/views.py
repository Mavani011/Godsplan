from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user_id == request.user.id or request.user.is_staff


class ReviewViewSet(viewsets.ModelViewSet):
    """
    /api/reviews/?target_type=place&target_id=5   - reviews for one place
    /api/reviews/                                  - create a review (any target)
    /api/reviews/{id}/mark_helpful/                - upvote
    /api/reviews/{id}/flag/                        - report for moderation
    """

    queryset = Review.objects.filter(is_approved=True).select_related("user", "content_type")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ["created_at", "rating", "helpful_count"]

    def get_queryset(self):
        qs = super().get_queryset()
        target_type = self.request.query_params.get("target_type")
        target_id = self.request.query_params.get("target_id")
        if target_type and target_id:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.filter(app_label="catalog", model=target_type).first()
            if ct:
                qs = qs.filter(content_type=ct, object_id=target_id)
        return qs

    @action(detail=True, methods=["post"])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_count = models_f_increment(review)
        review.save(update_fields=["helpful_count"])
        return Response({"helpful_count": review.helpful_count})

    @action(detail=True, methods=["post"])
    def flag(self, request, pk=None):
        review = self.get_object()
        review.is_flagged = True
        review.save(update_fields=["is_flagged"])
        return Response({"status": "flagged for moderation"})


def models_f_increment(review):
    return review.helpful_count + 1
