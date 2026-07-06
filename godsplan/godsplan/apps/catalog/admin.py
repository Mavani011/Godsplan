from django.contrib import admin
from .models import Place, FoodItem, College


class FoodItemInline(admin.TabularInline):
    model = FoodItem
    extra = 0
    fields = ("name", "price", "is_vegetarian", "is_available", "average_rating", "order_count")
    readonly_fields = ("average_rating", "order_count")


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = (
        "name", "place_type", "city", "price_level", "average_rating",
        "review_count", "popularity_score", "is_verified", "is_active",
    )
    list_filter = ("place_type", "city", "is_verified", "is_active", "price_level")
    search_fields = ("name", "address_line", "city")
    inlines = [FoodItemInline]
    actions = ["verify_selected", "deactivate_selected"]
    readonly_fields = ("average_rating", "review_count", "popularity_score")

    @admin.action(description="Mark selected places as verified")
    def verify_selected(self, request, queryset):
        queryset.update(is_verified=True)

    @admin.action(description="Deactivate selected places")
    def deactivate_selected(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ("name", "place", "price", "is_vegetarian", "is_available", "average_rating", "order_count")
    list_filter = ("is_vegetarian", "is_available")
    search_fields = ("name", "place__name")


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = (
        "name", "city", "average_rating", "review_count", "popularity_score",
        "has_hostel", "has_mess", "is_verified", "is_active",
    )
    list_filter = ("city", "is_verified", "is_active", "has_hostel", "has_mess")
    search_fields = ("name", "city", "affiliation")
    readonly_fields = ("average_rating", "review_count", "popularity_score")
    actions = ["verify_selected"]

    @admin.action(description="Mark selected colleges as verified")
    def verify_selected(self, request, queryset):
        queryset.update(is_verified=True)
