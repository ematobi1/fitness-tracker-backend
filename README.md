# Fitness Tracker API

A real Express + PostgreSQL backend — verified end-to-end (register, login, JWT auth,
workout CRUD, water intake sync) against a live Postgres instance before delivery.

## Endpoints

| Method | Path              | Auth | Description |
|--------|-------------------|------|-------------|
| GET    | `/health`         | No   | Uptime check |
| POST   | `/register`       | No   | `{ name, username, password }` → `{ token, user }` |
| POST   | `/login`          | No   | `{ username, password }` → `{ token, user }` |
| GET    | `/me`             | Yes  | Returns the logged-in user |
| GET    | `/workouts`       | Yes  | List saved workouts |
| POST   | `/workouts`       | Yes  | `{ name, exercises[], restSeconds }` → saved workout |
| DELETE | `/workouts/:id`   | Yes  | Remove a saved workout |
| GET    | `/water/today`    | Yes  | `{ count }` for today |
| PUT    | `/water/today`    | Yes  | `{ count }` → updates today's count |

Authenticated routes expect `Authorization: Bearer <token>`.

## Deploy to Render (recommended — free tier, no credit card)

Render can't be set up by an AI on your behalf — account creation and OAuth logins
are things only you can do. Takes about 5 minutes:

1. **Push this folder to a GitHub repo.** If you don't already have one:
   ```bash
   cd fitness-tracker-backend
   git init
   git add .
   git commit -m "Initial backend"
   git branch -M main
   git remote add origin https://github.com/<your-username>/fitness-tracker-backend.git
   git push -u origin main
   ```

2. Go to **[render.com](https://render.com)** → sign up (free, GitHub login is fastest).

3. Click **New +** → **Blueprint** → connect the repo you just pushed.
   Render will read `render.yaml` automatically and set up both the web service
   and a free PostgreSQL database, wiring `DATABASE_URL` and generating `JWT_SECRET`
   for you — no manual env var entry needed.

4. Click **Apply** / **Deploy**. First deploy takes ~2-3 minutes.

5. Once live, open the **Shell** tab on the web service in Render's dashboard and run:
   ```bash
   npm run migrate
   ```
   This creates the database tables. (One-time step, only needed once.)

6. Copy your service's URL — it'll look like `https://fitness-tracker-api-xxxx.onrender.com`.

7. **Send that URL back to Claude** — that's the one piece needed to wire the mobile
   app to this live backend and switch it off mock mode.

**Free tier note:** Render's free web services sleep after 15 minutes of no traffic
and take ~30-50 seconds to wake on the next request. Fine for testing; if that
delay matters for real users later, their $7/mo tier removes it.

## Deploy to Railway (alternative)

1. Push to GitHub as above.
2. [railway.app](https://railway.app) → sign up → **New Project** → **Deploy from GitHub repo**.
3. Add a PostgreSQL plugin (**New** → **Database** → **PostgreSQL**) — Railway auto-injects `DATABASE_URL`.
4. In the web service's **Variables** tab, add `JWT_SECRET` manually (generate one with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
5. Open the service's shell/console and run `npm run migrate`.
6. Copy the generated public domain URL and send it back.

## Local development

```bash
npm install
cp .env.example .env   # then fill in a local DATABASE_URL and JWT_SECRET
npm run migrate
npm start
```
