from django.contrib import admin
from .models import OrderRequest


@admin.register(OrderRequest)
class OrderRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "food_item", "place", "quantity", "total_price", "status", "created_at")
    list_filter = ("status", "fulfilment_type")
    search_fields = ("user__username", "food_item__name", "place__name")
    list_editable = ("status",)
    readonly_fields = ("unit_price", "total_price")
