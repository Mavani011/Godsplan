# This app is intentionally model-less: it's a service + API layer that
# reads from apps.catalog / apps.preferences / apps.reviews and writes
# RecommendationLog rows (owned by apps.search) and Notifications.
