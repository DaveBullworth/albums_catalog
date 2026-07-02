# 🎵 Resonance

A personal, neon-lit catalogue of the albums you love. Import records from
Spotify in one click, rate and review them, and keep your collection close —
every card glowing with the dominant colour of its cover.

This is a ground-up rebuild of the original PERN album catalogue (preserved in
[`legacy/`](./legacy)) as a modern, free-to-host app.

---

## ✨ Features

- **Username-only auth** — no email required; each user gets their own catalogue.
- **Spotify import** — paste an album link; covers, artists, year and the full
  tracklist arrive instantly (Spotify Web API, Client-Credentials flow).
- **Rate & review** — like/skip an album, star favourites, star individual
  tracks, write a review.
- **Filter, sort, paginate** — search by artist/album, filter by year range or
  liked/favourites, sort by recency, year, artist or name. All URL-driven.
- **Dynamic colour** — each album's accent is the dominant colour of its cover,
  extracted server-side at import time.
- **Admin panel** — list every user with album counts, promote/demote admins,
  delete accounts, and **"enter as user"** impersonation to view and manage any
  catalogue.
- **RU / EN** internationalisation and a cohesive dark/neon design system.

## 🧱 Tech stack

| Layer | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router, TypeScript) — frontend **and** backend in one repo |
| Styling | **Tailwind CSS v4** + a custom design system, **Motion** for animation |
| Database | **Supabase Postgres** (real Postgres, free tier) |
| Auth | **Supabase Auth** + **Row Level Security** for per-user isolation |
| Covers | Served straight from the **Spotify CDN** — never stored |
| Colour | **sharp** (`stats().dominant`) at import time |
| Hosting | **Vercel** (Hobby) + Supabase free — $0 |

There is **no separate backend service**: all server logic lives in Next.js
Server Actions and Route Handlers, so there is exactly one app to deploy.

---

## 🚀 Getting started

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration in
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   This creates the `profiles`, `albums` and `tracks` tables, RLS policies, and
   the signup trigger.
3. In **Authentication → Providers → Email**, **disable "Confirm email"**.
   Resonance uses a username-only flow backed by a synthetic internal email, so
   there is no inbox to confirm.
4. From **Project Settings → API**, copy the **Project URL**, the **anon**
   public key, and the **service_role** key.

### 2. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app and copy its **Client ID** and **Client Secret**.
   (No redirect URI is needed — we only use the Client-Credentials flow.)

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server only
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
IMPERSONATION_SECRET=...             # `openssl rand -hex 32`
```

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register a user, and start
pasting Spotify links.

### 5. Make yourself an admin

Register normally, then in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where username = 'your_username';
```

Reload — the **Admin** link appears in the nav.

---

## ☁️ Deploy to Vercel (free)

1. Push this repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repository.
   Vercel auto-detects Next.js — no build config needed.
3. Add the same environment variables from `.env.local` in
   **Project → Settings → Environment Variables**.
4. Deploy. That's it — the app and its API run as Vercel serverless functions;
   the database lives in Supabase.

> The Supabase free tier and Vercel Hobby tier are enough to run this for
> personal use at no cost.

---

## 🗂️ Project structure

```
src/
├── app/
│   ├── (auth)/            # login, register, auth server actions
│   ├── (app)/             # authenticated shell (nav + impersonation banner)
│   │   ├── catalog/       # catalogue page + album server actions
│   │   ├── account/       # account settings
│   │   └── admin/         # user administration + impersonation actions
│   ├── layout.tsx         # fonts, providers, locale
│   └── page.tsx           # public landing (redirects to /catalog if signed in)
├── components/            # ui kit, catalogue, admin, brand, providers
├── lib/
│   ├── supabase/          # browser / server / service-role clients + session
│   ├── auth.ts            # auth context + impersonation resolver
│   ├── spotify.ts         # Spotify Web API client
│   ├── color.ts           # dominant-colour extraction (sharp)
│   ├── queries.ts         # catalogue reads
│   └── validation.ts      # zod schemas
├── proxy.ts               # session refresh + route protection (Next 16 proxy)
└── supabase/migrations/   # database schema + RLS
```

## 🔐 How a few things work

- **Per-user isolation** is enforced at the database by Row Level Security, not
  just in code. Admins can read any catalogue via an `is_admin()` policy.
- **Impersonation** stores a signed, http-only cookie holding the target user's
  id. The admin's own session stays intact; catalogue access is re-scoped to the
  impersonated user via the service-role client, with a persistent exit banner.
- **Covers** are referenced by their Spotify CDN URL and never copied, so there
  is no file storage to manage or pay for.

## 🏛️ Legacy

The original Dockerised PERN implementation lives in [`legacy/`](./legacy) for
reference. It is not part of the build.
