from rest_framework import serializers
from apps.catalog.models import FoodItem
from .models import OrderRequest


class OrderRequestSerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source="food_item.name", read_only=True)
    place_name = serializers.CharField(source="place.name", read_only=True)

    class Meta:
        model = OrderRequest
        fields = [
            "id", "place", "place_name", "food_item", "food_item_name", "quantity",
            "unit_price", "total_price", "fulfilment_type", "delivery_address",
            "delivery_latitude", "delivery_longitude", "status",
            "special_instructions", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "unit_price", "total_price", "status", "created_at", "updated_at"]

    def validate(self, attrs):
        food_item = attrs["food_item"]
        if not food_item.is_available:
            raise serializers.ValidationError("This item is currently unavailable.")
        if attrs.get("place") and attrs["place"] != food_item.place:
            raise serializers.ValidationError("food_item does not belong to the given place.")
        attrs["place"] = food_item.place
        return attrs

    def create(self, validated_data):
        food_item = validated_data["food_item"]
        validated_data["user"] = self.context["request"].user
        validated_data["unit_price"] = food_item.price
        order = OrderRequest.objects.create(**validated_data)
        # popularity signal for the ranking service
        FoodItem.objects.filter(pk=food_item.pk).update(order_count=food_item.order_count + order.quantity)
        return order
