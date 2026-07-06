from rest_framework import serializers
from .models import Place, FoodItem, College, SavedItem


class FoodItemSerializer(serializers.ModelSerializer):
    place_name = serializers.CharField(source="place.name", read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            "id", "place", "place_name", "category", "name", "description", "price",
            "is_vegetarian", "is_available", "image", "average_rating", "review_count",
            "order_count",
        ]
        read_only_fields = ["id", "average_rating", "review_count", "order_count"]


class PlaceListSerializer(serializers.ModelSerializer):
    """Lightweight - used in search/recommendation result lists."""
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Place
        fields = [
            "id", "name", "place_type", "city", "latitude", "longitude",
            "price_level", "average_rating", "review_count", "popularity_score",
            "cover_image", "distance_km", "is_verified",
        ]


class PlaceDetailSerializer(serializers.ModelSerializer):
    """Full 'all-in-one' page: place info + its menu + review summary."""
    food_items = FoodItemSerializer(many=True, read_only=True)
    near_college_name = serializers.CharField(source="near_college.name", read_only=True)

    class Meta:
        model = Place
        fields = [
            "id", "name", "place_type", "description", "address_line", "city", "state",
            "pincode", "latitude", "longitude", "near_college", "near_college_name",
            "price_level", "average_cost_for_two", "average_rating", "review_count",
            "popularity_score", "opens_at", "closes_at", "is_open_24h", "phone_number",
            "cover_image", "is_verified", "food_items", "created_at",
        ]


class CollegeListSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = College
        fields = [
            "id", "name", "city", "programs_offered", "average_rating",
            "review_count", "popularity_score", "has_hostel", "has_mess",
            "logo", "distance_km", "is_verified",
        ]


class CollegeDetailSerializer(serializers.ModelSerializer):
    """Full college page: profile + nearby hostels/mess/food (Places)."""
    nearby_places = PlaceListSerializer(many=True, read_only=True)

    class Meta:
        model = College
        fields = [
            "id", "name", "city", "state", "latitude", "longitude",
            "programs_offered", "affiliation", "established_year",
            "admission_process", "fees_range_min", "fees_range_max",
            "has_hostel", "has_mess", "fest_name", "fest_month", "website",
            "phone_number", "logo", "average_rating", "review_count",
            "popularity_score", "is_verified", "nearby_places", "created_at",
        ]


class SavedItemSerializer(serializers.ModelSerializer):
    """
    Client sends target_type ('place'|'college') + target_id. We return a
    single composite `item_id` field (e.g. "place-5") that the frontends use
    as the ContentItem.id, so bookmarks round-trip cleanly on both apps.
    """
    target_type = serializers.ChoiceField(choices=["place", "college"], write_only=True)
    target_id = serializers.IntegerField(write_only=True)
    item_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SavedItem
        fields = ["id", "target_type", "target_id", "item_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_item_id(self, obj):
        return f"{obj.content_type.model}-{obj.object_id}"

    def validate(self, attrs):
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get(app_label="catalog", model=attrs["target_type"])
        attrs["content_type"] = ct
        attrs["object_id"] = attrs.pop("target_id")
        attrs.pop("target_type")
        return attrs
