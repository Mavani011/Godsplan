from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    path("api/preferences/", include("apps.preferences.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/search/", include("apps.search.urls")),
    path("api/recommendations/", include("apps.recommendations.urls")),

    # OpenAPI schema + Swagger UI - handy for the frontend/mobile team
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
