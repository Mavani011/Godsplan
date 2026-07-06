from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "budget_band", "is_college_seeker", "created_at")
    list_filter = ("budget_band", "is_college_seeker", "gender", "city")
    search_fields = ("user__username", "user__email", "phone_number", "city")
    autocomplete_fields = ("user",)
