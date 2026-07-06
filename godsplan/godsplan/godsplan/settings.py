"""
GodsPlan settings.
Reads all environment-specific values from .env via python-decouple so the
same codebase runs locally, on Cloud Run, and on GKE without modification.
"""
from pathlib import Path
from decouple import config, Csv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="dev-only-insecure-key")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third party
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    "drf_spectacular",

    # local apps
    "apps.accounts",
    "apps.preferences",
    "apps.catalog",
    "apps.reviews",
    "apps.orders",
    "apps.notifications",
    "apps.search",
    "apps.recommendations",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "godsplan.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "godsplan.wsgi.application"
ASGI_APPLICATION = "godsplan.asgi.application"

DATABASE_URL = config("DATABASE_URL", default="postgresql://postgres:123456@localhost:5432/Godsplan")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            ssl_require=config("DB_SSL_REQUIRED", default=True, cast=bool),
        )
    }
elif config("DB_HOST", default=""):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="godsplan"),
            "USER": config("DB_USER", default="godsplan_user"),
            "PASSWORD": config("DB_PASSWORD", default=""),
            "HOST": config("DB_HOST", default="127.0.0.1"),
            "PORT": config("DB_PORT", default="5432"),
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = config("TIME_ZONE", default="Asia/Kolkata")
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static & media - local disk in dev, Google Cloud Storage in production
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

USE_GCS = config("USE_GCS", default=False, cast=bool)
if USE_GCS:
    STORAGES = {
        "default": {"BACKEND": "storages.backends.gcloud.GoogleCloudStorage"},
        "staticfiles": {"BACKEND": "storages.backends.gcloud.GoogleCloudStorage"},
    }
    GS_BUCKET_NAME = config("GS_BUCKET_NAME")
    GS_PROJECT_ID = config("GS_PROJECT_ID")
    GS_DEFAULT_ACL = "publicRead"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# DRF
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"user": "300/hour", "anon": "60/hour"},
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {"TITLE": "GodsPlan API", "VERSION": "1.0.0"}

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = "auth.User"  # keep Django's built-in User; UserProfile extends it 1:1

# App-level tuning
DEFAULT_SEARCH_RADIUS_KM = config("DEFAULT_SEARCH_RADIUS_KM", default=10, cast=float)
