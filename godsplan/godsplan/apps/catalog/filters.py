import django_filters as df
from .models import Place, College


class PlaceFilter(df.FilterSet):
    place_type = df.CharFilter(field_name="place_type")
    city = df.CharFilter(field_name="city", lookup_expr="iexact")
    min_rating = df.NumberFilter(field_name="average_rating", lookup_expr="gte")
    max_price_level = df.NumberFilter(field_name="price_level", lookup_expr="lte")
    is_open_24h = df.BooleanFilter(field_name="is_open_24h")

    class Meta:
        model = Place
        fields = ["place_type", "city", "min_rating", "max_price_level", "is_open_24h"]


class CollegeFilter(df.FilterSet):
    city = df.CharFilter(field_name="city", lookup_expr="iexact")
    program = df.CharFilter(method="filter_program")
    min_rating = df.NumberFilter(field_name="average_rating", lookup_expr="gte")
    has_hostel = df.BooleanFilter(field_name="has_hostel")
    has_mess = df.BooleanFilter(field_name="has_mess")

    def filter_program(self, queryset, name, value):
        return queryset.filter(programs_offered__icontains=value)

    class Meta:
        model = College
        fields = ["city", "program", "min_rating", "has_hostel", "has_mess"]
