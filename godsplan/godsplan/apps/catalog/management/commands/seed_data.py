"""
Usage: python manage.py seed_data

Creates a small but realistic dataset for Surat, Gujarat so the API and
ranking service can be exercised end-to-end immediately after migrate.
"""
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.accounts.models import UserProfile
from apps.preferences.models import PreferenceCategory, UserPreference
from apps.catalog.models import Place, FoodItem, College
from apps.reviews.models import Review


class Command(BaseCommand):
    help = "Seed GodsPlan with sample preference categories, places, food, colleges, users, and reviews."

    def handle(self, *args, **options):
        self.stdout.write("Seeding preference categories...")
        food_names = ["Khaman", "Khaus", "Idada", "Dabeli", "Pav Bhaji", "Undhiyu", "Locho", "Fafda"]
        food_cats = {}
        for name in food_names:
            cat, _ = PreferenceCategory.objects.get_or_create(
                type=PreferenceCategory.Type.FOOD, name=name,
                defaults={"slug": slugify(f"food-{name}")},
            )
            food_cats[name] = cat

        program_names = ["B.Tech Computer Science", "B.Tech Mechanical", "MBBS", "B.Com", "MBA", "B.Pharm"]
        program_cats = {}
        for name in program_names:
            cat, _ = PreferenceCategory.objects.get_or_create(
                type=PreferenceCategory.Type.PROGRAM, name=name,
                defaults={"slug": slugify(f"program-{name}")},
            )
            program_cats[name] = cat

        self.stdout.write("Seeding users...")
        demo, _ = User.objects.get_or_create(username="demo_user", defaults={"email": "demo@godsplan.app"})
        demo.set_password("Demo@12345")
        demo.save()
        UserProfile.objects.update_or_create(
            user=demo,
            defaults=dict(city="Surat", latitude=21.1702, longitude=72.8311,
                          budget_band=UserProfile.BudgetBand.MEDIUM,
                          is_college_seeker=True, desired_program="B.Tech Computer Science",
                          target_city="Surat"),
        )
        UserPreference.objects.get_or_create(user=demo, category=food_cats["Khaman"], defaults={"weight": 9})
        UserPreference.objects.get_or_create(user=demo, category=food_cats["Locho"], defaults={"weight": 7})
        UserPreference.objects.get_or_create(user=demo, category=program_cats["B.Tech Computer Science"], defaults={"weight": 10})

        self.stdout.write("Seeding colleges...")
        svnit, _ = College.objects.get_or_create(
            name="Sardar Vallabhbhai National Institute of Technology",
            defaults=dict(
                city="Surat", state="Gujarat", latitude=21.1614, longitude=72.7853,
                programs_offered=["B.Tech Computer Science", "B.Tech Mechanical", "B.Tech Electrical"],
                affiliation="Institute of National Importance", established_year=1961,
                admission_process="JEE Main + JoSAA/CSAB counselling",
                fees_range_min=125000, fees_range_max=140000,
                has_hostel=True, has_mess=True, fest_name="Prasoon", fest_month="February",
                website="https://svnit.ac.in", average_rating=4.5, review_count=120,
                popularity_score=980, is_verified=True,
            ),
        )
        vnsgu, _ = College.objects.get_or_create(
            name="Veer Narmad South Gujarat University",
            defaults=dict(
                city="Surat", state="Gujarat", latitude=21.1359, longitude=72.7933,
                programs_offered=["B.Com", "MBA", "B.Pharm"],
                affiliation="State University", established_year=1967,
                admission_process="Merit-based online counselling",
                fees_range_min=20000, fees_range_max=60000,
                has_hostel=True, has_mess=True, fest_name="Sanskruti", fest_month="January",
                website="https://vnsgu.ac.in", average_rating=4.1, review_count=64,
                popularity_score=610, is_verified=True,
            ),
        )

        self.stdout.write("Seeding places (restaurants, PG, mess)...")
        khaman_house, _ = Place.objects.get_or_create(
            name="Surti Khaman House", place_type=Place.PlaceType.STREET_FOOD,
            defaults=dict(
                description="Legendary soft khaman and fafda since 1985.",
                address_line="Near Athwa Gate", city="Surat", state="Gujarat",
                latitude=21.1780, longitude=72.8310, price_level=1,
                average_cost_for_two=150, average_rating=4.6, review_count=340,
                popularity_score=890, is_open_24h=False, is_verified=True,
            ),
        )
        cafe_hangout, _ = Place.objects.get_or_create(
            name="Cafe Hangout", place_type=Place.PlaceType.CAFE,
            defaults=dict(
                description="Cozy cafe popular with SVNIT students.",
                address_line="Near SVNIT Gate", city="Surat", state="Gujarat",
                latitude=21.1620, longitude=72.7860, price_level=2,
                near_college=svnit, average_cost_for_two=400,
                average_rating=4.3, review_count=210, popularity_score=560, is_verified=True,
            ),
        )
        pg_near_svnit, _ = Place.objects.get_or_create(
            name="Scholars PG for Boys", place_type=Place.PlaceType.PG,
            defaults=dict(
                description="AC/Non-AC rooms, WiFi, laundry, 5 min walk to SVNIT.",
                address_line="Athwalines", city="Surat", state="Gujarat",
                latitude=21.1600, longitude=72.7845, price_level=2,
                near_college=svnit, average_cost_for_two=8000,
                average_rating=4.0, review_count=48, popularity_score=210, is_verified=True,
            ),
        )
        mess_near_svnit, _ = Place.objects.get_or_create(
            name="Annapurna Mess", place_type=Place.PlaceType.MESS,
            defaults=dict(
                description="Home-style Gujarati thali, monthly mess plans.",
                address_line="Athwalines", city="Surat", state="Gujarat",
                latitude=21.1605, longitude=72.7850, price_level=1,
                near_college=svnit, average_cost_for_two=100,
                average_rating=4.2, review_count=76, popularity_score=180, is_verified=True,
            ),
        )

        self.stdout.write("Seeding food items...")
        FoodItem.objects.get_or_create(
            place=khaman_house, name="Khaman", category=food_cats["Khaman"],
            defaults=dict(description="Soft steamed khaman with green chutney", price=40,
                          is_vegetarian=True, average_rating=4.7, review_count=180, order_count=920),
        )
        FoodItem.objects.get_or_create(
            place=khaman_house, name="Fafda Jalebi", category=food_cats["Fafda"],
            defaults=dict(description="Crispy fafda with hot jalebi", price=60,
                          is_vegetarian=True, average_rating=4.5, review_count=95, order_count=430),
        )
        FoodItem.objects.get_or_create(
            place=cafe_hangout, name="Cold Coffee", category=None,
            defaults=dict(description="Classic cold coffee with ice cream", price=120,
                          is_vegetarian=True, average_rating=4.4, review_count=60, order_count=310),
        )

        self.stdout.write("Seeding a sample review...")
        place_ct = ContentType.objects.get_for_model(Place)
        Review.objects.get_or_create(
            user=demo, content_type=place_ct, object_id=khaman_house.pk,
            defaults=dict(rating=5, title="Best khaman in Surat!",
                          body="Consistently soft and fresh, been going here for years. "
                               "Highly recommend the fafda-jalebi combo too.",
                          helpful_count=12),
        )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
