GodsPlan
========

GodsPlan is an AI-assisted personalized recommendation platform for food, places, and colleges.
It includes:

- Django 5 backend with Django REST Framework
- PostgreSQL support
- Two React + TypeScript + Vite frontends:
  - link2layout
  - instant-ui-forge

Project Structure
-----------------

godsplan/
├── godsplan/               # Django backend
│   ├── apps/               # Django apps
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── README .md
│   └── README.md
├── link2layout/            # React frontend
├── instant-ui-forge/       # React frontend
├── package.json
├── tsconfig.json
└── vite.config.ts

Features
--------

- Token-based auth via Django REST Framework
- Email/login support
- Personalized recommendation service
- Preference-based matching
- Search, reviews, orders, notifications
- Cloud-ready design for Google Cloud Run / Cloud SQL / Cloud Storage

Backend Setup
-------------

Prerequisites:
- Python 3.14
- PostgreSQL
- Node.js (for frontend)

Install:

cd godsplan
python -m venv venv
venv\Scripts\Activate.ps1      # PowerShell
# OR
venv\Scripts\activate.bat      # cmd
pip install -r requirements.txt

Environment:

copy .env.example .env

Key .env values:
- DATABASE_URL
- DJANGO_SECRET_KEY
- DB_SSL_REQUIRED
- USE_GCS (optional)
- GS_BUCKET_NAME / GS_PROJECT_ID (optional)

Run Migrations:

python manage.py migrate

Seed Demo Data:

python manage.py seed_data

Start Backend:

python manage.py runserver

Frontend Setup
--------------

Each frontend is a separate Vite + React app.

Install dependencies:

cd link2layout
npm install
cd ../instant-ui-forge
npm install

Start local dev server:

cd link2layout
npm run dev

cd instant-ui-forge
npm run dev

Build:

npm run build

Demo Credentials
----------------

- Username: demo_user
- Password: Demo@12345

API Overview
------------

The backend exposes REST endpoints under /api/.
Common routes:

- /api/auth/register/
- /api/auth/login/
- /api/auth/logout/
- /api/auth/profile/me/
- /api/preferences/categories/
- /api/catalog/places/
- /api/catalog/colleges/
- /api/reviews/
- /api/orders/
- /api/notifications/
- /api/search/
- /api/recommendations/places/
- /api/docs/
