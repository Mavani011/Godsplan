# GodsPlan Backend

AI-assisted, personalized recommendation platform for food, places, and
colleges — built with Django 5, Django REST Framework, and PostgreSQL, and
structured to deploy cleanly on Google Cloud (Cloud Run + Cloud SQL + Cloud
Storage).

---

## 1. Folder structure

```
godsplan/
├── manage.py
├── requirements.txt
├── .env.example
├── godsplan/                     # project config
│   ├── settings.py               # PostgreSQL + GCS + DRF settings, env-driven
│   ├── urls.py                   # root router -> includes every app's urls.py
│   ├── wsgi.py / asgi.py
│
└── apps/
    ├── accounts/                 # UserProfile + auth (register/login/logout)
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py
    ├── preferences/               # PreferenceCategory + UserPreference
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py
    ├── catalog/                   # Place, FoodItem, College (the inventory)
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py  filters.py
    │   └── management/commands/seed_data.py
    ├── reviews/                   # generic Review (works for Place/FoodItem/College)
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py  signals.py  apps.py
    ├── orders/                    # OrderRequest - in-app ordering
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py
    ├── notifications/             # Notification + NotificationPreference
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py
    ├── search/                    # SearchHistory, RecommendationLog, global search
    │   ├── models.py  serializers.py  views.py  urls.py  admin.py
    └── recommendations/           # the ranking SERVICE layer (no models of its own)
        ├── services.py  views.py  urls.py
```

Each domain is its own Django app (`models.py`, `serializers.py`, `views.py`,
`urls.py`, `admin.py`) so the codebase stays navigable as it grows, and each
app can later be split into its own microservice/team ownership if needed.

---

## 2. What each piece does (brief)

| File | Purpose |
|---|---|
| `godsplan/settings.py` | Reads every environment-specific value (DB creds, secret key, GCS bucket, CORS) from `.env` via `python-decouple`. Plain PostgreSQL (no PostGIS/GDAL) is used deliberately — distance math is done with the Haversine / spherical-law-of-cosines formula in SQL (`recommendations/services.py::annotate_distance`), which keeps the Cloud Run container simple. Swap in PostGIS later only if you need true polygon/geo queries at scale. |
| `apps/accounts` | Extends Django's built-in `auth.User` with a 1:1 `UserProfile` (location, budget band, college-goal fields). Token-auth register/login/logout + `/profile/me/`. |
| `apps/preferences` | `PreferenceCategory` is an **admin-curated taxonomy** (food items, cuisines, study programs, amenities) stored as data, not hardcoded choices — so new options (a user's own food, a new program) can be added without a deploy. `UserPreference` is a weighted (1–10) link between a user and a category; this weight is what "I love food" turns into underneath. |
| `apps/catalog` | `Place` (restaurant/cafe/street-food/PG/hostel/mess/tourist spot), `FoodItem` (menu items with your own price, not scraped from a third party), `College` (programs, fees, hostel/mess flags, fest info). `Place.near_college` links hostels/mess/food outlets to a specific college for the "everything near my college" view. |
| `apps/reviews` | One `Review` model using a **generic foreign key**, so the same table/API reviews a Place, FoodItem, or College — the "all-in-one review system" from the brief. A signal (`signals.py`) recomputes each target's `average_rating`/`review_count` whenever a review is saved/deleted, so ranking reads are cheap (no live aggregation query). |
| `apps/orders` | `OrderRequest` captures "place order" **inside GodsPlan's own database** — same item, same price, no redirect to Swiggy/Zomato. It's deliberately a simple one-row-per-order model so a real payments/dispatch pipeline can be layered on later. |
| `apps/notifications` | `Notification` (the "this is the best place to visit" push) + `NotificationPreference` (per-user opt-in/opt-out, quiet hours). |
| `apps/search` | `SearchHistory` logs every search (query, type, location, time) — this is the raw signal used for "what do people near me search for right now." `RecommendationLog` records exactly what was shown to a user and why (`score_breakdown`), so you can audit/tune the algorithm and know what to notify about. |
| `apps/recommendations/services.py` | **The ranking service.** Framework-light, pure Python + ORM annotations — see §4. |

---

## 3. APIs

All endpoints are versioned under `/api/`. Auth uses DRF Token auth
(`Authorization: Token <key>`); swap for `SimpleJWT` later if you need
short-lived tokens — the serializer layer doesn't change.

| Endpoint | Method(s) | Purpose |
|---|---|---|
| `/api/auth/register/` | POST | Create user + blank profile, returns token |
| `/api/auth/login/` | POST | Returns token |
| `/api/auth/logout/` | POST | Revoke token |
| `/api/auth/profile/me/` | GET/PATCH | Own profile (location, budget, college goal) |
| `/api/preferences/categories/` | GET/POST | Browse taxonomy; authenticated users can add their own option (flagged for moderation) |
| `/api/preferences/categories/suggest/?type=FOOD&count=5` | GET | **"Shuffle / confused" endpoint** — time-of-day + crowd-popularity aware random suggestions |
| `/api/preferences/mine/` | GET/POST | CRUD your own weighted preferences (upsert on repeat POST) |
| `/api/preferences/mine/bulk_set/` | POST | Save a whole onboarding screen in one call |
| `/api/catalog/places/?city=&place_type=&lat=&lng=` | GET/POST | List/search places, distance-sorted when lat/lng given |
| `/api/catalog/places/{id}/` | GET | Full place page: info + menu + rating |
| `/api/catalog/food-items/?search=khaman` | GET/POST | Search menu items across places |
| `/api/catalog/colleges/?city=&program=` | GET/POST | List/search colleges |
| `/api/catalog/colleges/{id}/` | GET | Full college page: programs, fees, fest, **nearby hostels/mess/food** |
| `/api/reviews/?target_type=place&target_id=5` | GET/POST | Reviews for any target; `mark_helpful/`, `flag/` actions |
| `/api/orders/` | GET/POST | Place & list your own in-app orders |
| `/api/orders/{id}/cancel/` | POST | Cancel a pending order |
| `/api/notifications/` | GET | Your inbox; `mark_read/`, `mark_all_read/` |
| `/api/notifications/preferences/me/` | GET/PATCH | Opt in/out of recommendation pushes |
| `/api/search/?q=&type=&city=&lat=&lng=` | GET | Global search across food/places/colleges, logs `SearchHistory` |
| `/api/search/history/` | GET | Your own past searches |
| `/api/search/recommendation-logs/` | GET | "Why was I shown this?" |
| `/api/recommendations/places/?lat=&lng=&city=&notify=1` | GET | **Personalized ranked places**, optionally pushes a notification for the top pick |
| `/api/recommendations/colleges/?lat=&lng=&city=` | GET | Personalized ranked colleges (program match + rating + distance) |
| `/api/docs/` | GET | Swagger UI (via drf-spectacular) |

All list endpoints support DRF pagination (20/page), `?search=`, `?ordering=`,
and model-specific filters via `django-filter`.

---

## 4. Recommendation ranking service

`apps/recommendations/services.py` → `RecommendationService`. Six factors,
each normalized to 0–1, combined with tunable weights:

```python
WEIGHTS = {
    "preference_match": 0.30,   # overlap with the user's UserPreference weights
    "proximity":         0.20,  # closer = higher, linear decay to a radius
    "rating":            0.20,  # Place/College.average_rating
    "popularity":        0.10,  # popularity_score / order_count vs. peers
    "time_relevance":    0.10,  # e.g. cafes score higher at breakfast time
    "review_quality":    0.10,  # Review.quality_score (length, photo, upvotes)
}
```

- **Distance** is computed in SQL (`annotate_distance`) using the spherical
  law of cosines — no PostGIS needed, works on stock PostgreSQL.
- **Time relevance** buckets the clock into BREAKFAST / LUNCH / SNACKS /
  DINNER / LATE_NIGHT and matches it against each place's inferred time
  windows.
- Every ranked result carries a human-readable `reason` (e.g. "only 0.9 km
  away", "highly rated") so the frontend can show *why* something was
  recommended — and `RecommendationService.log()` persists that as a
  `RecommendationLog` row and, if asked, fires a `Notification`.
- This is currently a transparent, explainable scoring model rather than a
  black-box ML model — a deliberate choice for a v1: it's debuggable, fast,
  and every weight can be tuned from one dictionary. When you have enough
  `RecommendationLog` + click-through data, you can retrain a learned model
  (e.g. gradient-boosted ranking) and swap it in behind the same
  `RecommendationService` interface without touching any views.

---

## 5. Sample seed data

```bash
python manage.py seed_data
```

Creates: demo user (`demo_user` / `Demo@12345`) with Surat location and
preferences (Khaman, Locho, B.Tech CSE); two colleges (SVNIT, VNSGU); a
street-food place, a cafe, a PG, and a mess near SVNIT; food items; and one
sample review. Enough to exercise search, recommendations, and reviews
end-to-end immediately after `migrate`.

---

## 6. Local setup

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in local Postgres creds
createdb godsplan              # or use an existing Postgres instance
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
python manage.py runserver
```

---

## 7. Migration notes

- Every custom app ships its `0001_initial.py` already generated — no need
  to run `makemigrations` on a fresh clone, just `migrate`.
- **If you add/change a model**, run `python manage.py makemigrations`
  (bare, no app names) — this only works correctly because every app has a
  proper `migrations/__init__.py` package. If you ever `mkdir` a new app by
  hand instead of `startapp`, remember to create `migrations/__init__.py`
  yourself, or Django will silently treat it as a "no-migrations" app and
  `makemigrations` will report "No changes detected" even though it isn't
  true (a real gotcha I hit and fixed while building this).
- `Review`'s generic relation means `ContentType` migrations (built into
  Django) must run before `reviews.0001_initial` — this is handled
  automatically by Django's dependency graph.
- Denormalized fields (`average_rating`, `review_count`, `popularity_score`,
  `order_count`) are updated by signals/serializer logic, not by a nightly
  batch job — safe for v1 traffic; move to an async task (Cloud Tasks /
  Celery) if review/order volume gets heavy enough to make synchronous
  updates slow.

---

## 8. Deployment notes for Google Cloud

**Recommended shape:** Cloud Run (stateless Django+DRF via gunicorn) +
Cloud SQL for PostgreSQL + Cloud Storage for media/static + Secret Manager
for credentials. This scales to zero when idle and scales out under load
without you managing servers.

1. **Containerize**
   ```dockerfile
   FROM python:3.12-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   RUN python manage.py collectstatic --noinput
   CMD exec gunicorn godsplan.wsgi:application --bind 0.0.0.0:$PORT --workers 3
   ```

2. **Cloud SQL for PostgreSQL**
   - Create an instance: `gcloud sql instances create godsplan-db --database-version=POSTGRES_15 ...`
   - Create the DB + user, then set `DB_HOST=/cloudsql/<PROJECT>:<REGION>:<INSTANCE>` in Cloud Run's env vars (Cloud Run mounts the Cloud SQL Auth Proxy socket automatically when you attach the instance).
   - Store `DB_PASSWORD` in **Secret Manager**, not in plain env vars.

3. **Cloud Storage for media/static**
   - Create a bucket (`gsutil mb gs://godsplan-media`), make it public-read for served assets or serve via signed URLs for private content.
   - Set `USE_GCS=True`, `GS_BUCKET_NAME`, `GS_PROJECT_ID` in Cloud Run env vars; mount a service-account key via Secret Manager and point `GOOGLE_APPLICATION_CREDENTIALS` at it (or, better, use Cloud Run's attached service account with the Storage Object Admin role — no key file needed).

4. **Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/$PROJECT_ID/godsplan
   gcloud run deploy godsplan \
     --image gcr.io/$PROJECT_ID/godsplan \
     --add-cloudsql-instances $PROJECT_ID:$REGION:godsplan-db \
     --set-env-vars DJANGO_SETTINGS_MODULE=godsplan.settings,DB_HOST=/cloudsql/$PROJECT_ID:$REGION:godsplan-db,... \
     --set-secrets DB_PASSWORD=db-password:latest,DJANGO_SECRET_KEY=django-secret:latest \
     --region $REGION --allow-unauthenticated
   ```

5. **Run migrations on deploy** — either a one-off Cloud Run Job
   (`gcloud run jobs execute`) running `python manage.py migrate`, or a
   Cloud Build step before the Cloud Run deploy step. Don't run migrations
   from inside the request-serving container's startup — a bad migration
   can then block every request.

6. **Push notifications**: pair `Notification` rows with Firebase Cloud
   Messaging — store the device token on `UserProfile.push_token`, and add a
   small service (`apps/notifications/services.py`, not yet built) that
   calls the FCM HTTP v1 API whenever a `Notification` is created for a user
   with `recommendations_enabled=True`.

7. **Static/admin security**: put Cloud Run behind Cloud Load Balancing +
   Cloud Armor if you expose `/admin/` publicly, or restrict it with
   Identity-Aware Proxy (IAP) instead of relying on Django auth alone.

8. **Observability**: Cloud Run auto-exports logs to Cloud Logging; add
   `django-prometheus` or Cloud Trace if you want request-level latency
   breakdowns on the recommendation endpoint once traffic grows.

---

## 9. Assumptions made (call these out if any need changing)

- Kept Django's built-in `auth.User` + a 1:1 `UserProfile`, rather than a
  fully custom user model — faster to ship, still swappable later since all
  domain fields live on `UserProfile`.
- Used **plain PostgreSQL + Haversine-in-SQL** for distance instead of
  PostGIS, to avoid GDAL native dependencies complicating the Cloud Run
  image. Fine for city-scale radius search; revisit if you need polygons or
  huge (>1M place) proximity indexes.
- `OrderRequest` is a request/intent record fulfilled by staff/admin for
  now, not a full payments+dispatch system — reflects "place order to me in
  my database," not a claim that delivery logistics are solved.
- Reviews use one `Review` model via generic relations (Place/FoodItem/
  College) rather than three separate tables, per "all-in-one review
  system."
- Push delivery (FCM) isn't wired up yet — `Notification` rows are created
  and readable via `/api/notifications/`, but actually pushing to a phone
  needs the FCM step in §8.6.

---

## 10. Suggestions & improvements for GodsPlan as a product

You described three ideas that are worth calling out explicitly, because
they shape the architecture:

1. **"Don't redirect to Swiggy — show the item at the same price and take
   the order myself."** This is the right instinct for owning the user
   relationship and the data, but it means *you* become responsible for
   price accuracy, availability, and fulfillment — none of which you get
   for free from an aggregator anymore. Two honest paths: (a) partner
   directly with local places to get a POS/menu feed (accurate live
   prices/stock), starting with a handful of places you onboard manually,
   or (b) start manual/curated (what `seed_data` demonstrates) and grow
   place-by-place. Trying to mirror Swiggy's entire catalog without either
   a feed or manual partnerships will drift out of sync fast.

2. **The college-admission flow (program → nearby hostels/mess/food/
   ratings/fest) is a genuinely distinct product from food discovery** —
   the buying cycle is once-a-year and research-heavy, not daily/impulsive
   like food. It's modeled here (`College.programs_offered`,
   `Place.near_college`), but consider whether it deserves its own
   onboarding flow/UI entirely, separate from "what should I eat right
   now," even though they share the same backend.

3. **The "shuffle when confused" flow** (`/preferences/categories/suggest/`)
   is a nice touch but its quality is entirely bounded by how much
   `UserPreference` data exists — with few users, it falls back to random.
   Consider seeding it initially with editorially-curated "popular in
   Surat right now" lists rather than relying purely on crowd data you
   don't have yet.

Other things worth adding as the product matures:
- **Rate limiting / abuse protection** on `/api/reviews/` and
  `/api/preferences/categories/` (user-submitted content) — already
  throttled at the DRF level (300/hr per user), but add profanity/spam
  filtering before content goes live if you open this to the public.
- **A/B testing hook** in `RecommendationService` — since every
  recommendation is already logged with its score breakdown, it's cheap to
  log a `variant` field later and compare ranking strategies.
- **SMS/WhatsApp fallback** for notifications in Tier-2/3 India markets
  where push notification delivery can be unreliable.
