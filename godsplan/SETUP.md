# GodsPlan — Full Setup Guide

This project has **one backend** (Django REST API + PostgreSQL) and **two
frontends that share it**:

| Folder              | What it is                          | Runs on              |
|---------------------|--------------------------------------|-----------------------|
| `godsplan/godsplan`  | Django REST API                     | http://127.0.0.1:8000 |
| `instant-ui-forge`  | **Web** app                          | http://localhost:3000 |
| `link2layout`       | **App** (mobile-style) frontend       | http://localhost:5173 |

Both frontends talk to the same Django API and the same Postgres database,
so anything a user saves, reviews, or bookmarks on one shows up on the
other immediately. (`src/` at the project root is an unused exact duplicate
of `instant-ui-forge` — you can ignore or delete it.)

There is no more Firebase or mock/local-storage data anywhere — every
screen on both frontends reads and writes through the real API.

---

## 1. Get a free cloud Postgres database (Neon)

1. Go to **https://neon.tech** → sign up free (no credit card).
2. Create a new project (any name, any region).
3. On the project dashboard, copy the **connection string** — it looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   (Supabase → https://supabase.com works the same way if you prefer it —
   the "Connection string" / URI on their Database settings page.)

You'll paste this into the backend's `.env` in the next step.

---

## 2. Backend setup (Django + Postgres)

```bash
cd godsplan/godsplan
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# open .env and paste your Neon connection string into DATABASE_URL=

python manage.py migrate
python manage.py seed_data       # creates sample colleges/places/food + a demo login
python manage.py createsuperuser # optional, for /admin/ and CMS write access
python manage.py runserver 0.0.0.0:8000
```

Verify it's alive: open **http://127.0.0.1:8000/api/catalog/places/** — you
should see JSON with sample places from Surat.

Demo login created by `seed_data`: **username** `demo_user` / **password**
`Demo@12345`.

API docs (Swagger UI): **http://127.0.0.1:8000/api/docs/**

> Note: writes to colleges/places/food (the CMS panel in the App frontend)
> require a *staff* account — use the superuser you created, or set
> `is_staff=True` on a user in `/admin/`. Regular users can still register,
> log in, save items, and write reviews.

---

## 3. Web frontend (`instant-ui-forge`)

```bash
cd instant-ui-forge
npm install
cp .env.example .env    # already has VITE_API_URL=http://127.0.0.1:8000
npm run dev              # http://localhost:3000
```

Go to the **Profile** tab → "Account Sync (Cloud Database)" panel to
register/sign in against the real backend. Once signed in, opening a
place/college card lets you **Rate** or **Save** it for real.

---

## 4. App frontend (`link2layout`)

```bash
cd link2layout
npm install
cp .env.example .env    # already has VITE_API_URL=http://127.0.0.1:8000
npm run dev              # http://localhost:5173
```

Sign up/sign in on the Auth screen. Discovery, College, Profile, Alerts,
and the CMS panel all now read/write the same Django API.

---

## 5. Prove the sync works

1. Register a new account on the **Web** app (port 3000).
2. Open a place, hit **Rate**, submit a review.
3. Open the **App** (port 5173), sign in with the *same* username/password.
4. Go to that same place's detail screen — your review is already there,
   because both apps hit the same backend + Postgres database.

---

## What changed from the original zip

- **Backend**: added the missing `/api/catalog/saved-items/` endpoint
  (model existed, endpoint didn't), added `DATABASE_URL` support
  (`dj-database-url`) so a single Neon/Supabase connection string configures
  Postgres, generated the missing `SavedItem` migration, widened default
  CORS origins to cover both frontends' dev ports.
- **`instant-ui-forge` (Web)**: added `src/api.ts` (the only file that talks
  HTTP); wired real registration/login, live Places+Colleges data (replacing
  the hardcoded mock array), reviews, and saved-items into the existing UI
  without changing its look.
- **`link2layout` (App)**: replaced `src/firebase.ts` with `src/api.ts`,
  keeping every exported function's name/signature identical so none of the
  screen components needed to change — only the data layer underneath was
  swapped from Firebase/localStorage to the real Django API.

Both frontends were verified to type-check (`tsc --noEmit`) and production-
build (`vite build`) cleanly, and the backend was verified end-to-end
(register → login → list catalog → save item → submit review → search) via
its own local test run.
