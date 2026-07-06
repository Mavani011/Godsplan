from django.db.models import Avg, Count
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Review


def _recompute(target):
    if target is None:
        return
    agg = Review.objects.filter(
        content_type__app_label=target._meta.app_label,
        content_type__model=target._meta.model_name,
        object_id=target.pk,
        is_approved=True,
    ).aggregate(avg=Avg("rating"), count=Count("id"))
    target.average_rating = round(agg["avg"] or 0, 2)
    target.review_count = agg["count"] or 0
    target.save(update_fields=["average_rating", "review_count"])


@receiver(post_save, sender=Review)
def on_review_saved(sender, instance, **kwargs):
    _recompute(instance.target)


@receiver(post_delete, sender=Review)
def on_review_deleted(sender, instance, **kwargs):
    _recompute(instance.target)
