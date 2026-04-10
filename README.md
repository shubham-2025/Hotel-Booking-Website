# QuickStay Migration

This repository is being migrated from a frontend-only Vite + React hotel booking UI into a full-stack Next.js application.

## Current Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Supabase client foundations
- Resend email foundations
- Vercel-ready deployment flow

## What Is Already Done

- Public pages migrated into Next.js:
  - home
  - rooms listing
  - room details
  - my bookings
- Owner pages migrated into Next.js:
  - dashboard
  - add room
  - list room
- Initial responsive redesign for mobile and tablet
- API route starters:
  - `/api/newsletter`
  - `/api/booking-inquiry`
- Initial Supabase schema migration:
  - `supabase/migrations/20260410_initial_schema.sql`

## Important Folders

- `app/` - Next.js routes and API handlers
- `components/` - new shared UI and owner components
- `lib/` - data helpers, Supabase clients, Resend client, mock data
- `docs/PROJECT_ROADMAP.md` - audit plus structured to-do list
- `legacy-vite/` - archived old Vite-only UI files kept for reference
- `src/assets/` - existing image and dummy asset source used by the new app

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables from `.env.example` into `.env.local`.

3. Run the app:

```bash
npm run dev
```

4. Build production output:

```bash
npm run build
```

## Next Recommended Steps

1. Configure Supabase project credentials in `.env.local`.
2. Apply the SQL migration in Supabase.
3. Replace mock data reads with live Supabase queries.
4. Add Supabase Auth for guest and owner roles.
5. Wire owner room creation to Storage uploads and inserts.
6. Configure Resend sender domain and booking email templates.
