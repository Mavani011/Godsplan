from django.conf import settings
from django.db import models


class OrderRequest(models.Model):
    """
    Captures a user's intent to order a FoodItem (or a batch of items)
    entirely inside GodsPlan - matching the product requirement of showing
    the item at the same price/place and taking the order ourselves rather
    than deep-linking to Swiggy/Zomato. In v1 this is a request record the
    Place owner/admin fulfils manually or via a future POS integration;
    it's intentionally simple (one row per order) so it can be wired to a
    real payment/dispatch pipeline later without a schema rewrite.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending confirmation"
        CONFIRMED = "CONFIRMED", "Confirmed by place"
        PREPARING = "PREPARING", "Being prepared"
        OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out for delivery"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    class FulfilmentType(models.TextChoices):
        DELIVERY = "DELIVERY", "Delivery"
        PICKUP = "PICKUP", "Self pickup"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    place = models.ForeignKey("catalog.Place", on_delete=models.CASCADE, related_name="order_requests")
    food_item = models.ForeignKey("catalog.FoodItem", on_delete=models.CASCADE, related_name="order_requests")

    quantity = models.PositiveSmallIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2, help_text="price snapshot at order time")
    total_price = models.DecimalField(max_digits=9, decimal_places=2)

    fulfilment_type = models.CharField(max_length=10, choices=FulfilmentType.choices, default=FulfilmentType.DELIVERY)
    delivery_address = models.CharField(max_length=255, blank=True)
    delivery_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    special_instructions = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["place", "status"]),
        ]
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.pk} - {self.food_item.name} x{self.quantity} ({self.status})"
