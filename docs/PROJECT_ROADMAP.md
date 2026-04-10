# Project Audit And Migration Roadmap

## 1. Current State Audit

### What is already built

- Home page sections already existed in the old Vite app: hero, featured destinations, exclusive offers, testimonials and newsletter UI.
- Listing flow already existed: all rooms page, room details page and a bookings page.
- Owner-facing UI already existed: dashboard, add-room page and list-room page.
- A design system direction already existed: hotel-focused visuals, Tailwind styling and reusable cards.

### What is missing right now

- No real backend is present in the repository, even though the old README mentions Express.
- Most business data is dummy data stored in `src/assets/assets.js`.
- Forms do not persist anything yet in production:
  - room search
  - room inquiry / availability
  - newsletter signup
  - add-room owner form
- Auth is not aligned with the target stack yet.
- The app was not reliably mobile responsive because many screens depended on fixed widths, wide tables and SPA layout assumptions.

## 2. Target Stack

- Frontend: Next.js App Router
- Database: PostgreSQL in Supabase
- Email: Resend
- Deployment: Vercel
- Recommended auth direction: Supabase Auth with role-based owner access

## 3. What I Have Started In This Turn

- Replaced the project shell from Vite scripts to Next.js scripts.
- Added a Next.js app router structure with:
  - site routes
  - owner routes
  - shared root layout
- Rebuilt the main public pages so they are more mobile friendly.
- Rebuilt the owner shell so it collapses well on smaller screens.
- Added backend foundation files for:
  - Supabase server/browser/admin clients
  - Resend client
  - newsletter API route
  - booking inquiry API route
- Added an initial Supabase SQL schema migration.

## 4. Recommended Next To-Do List

### Phase 1: Finish the migration foundation

- Install dependencies and verify `npm run build`.
- Remove or archive old Vite-only files once the Next app is fully stable.
- Decide final auth approach:
  - Supabase Auth only
  - Clerk retained temporarily

### Phase 2: Real data layer

- Seed `hotels`, `rooms`, `profiles` and `bookings`.
- Replace remaining dummy UI reads with Supabase queries.
- Add owner-specific queries for only that owner’s hotels and rooms.

### Phase 3: Auth and roles

- Add sign-in / sign-up screens.
- Create `guest`, `owner`, `admin` roles.
- Protect `/owner` routes with middleware and role checks.

### Phase 4: Booking engine

- Convert inquiry flow into real booking creation.
- Add availability checks to prevent overlapping bookings.
- Add booking status updates and payment state transitions.

### Phase 5: Owner workflows

- Connect add-room form to authenticated server actions or route handlers.
- Upload room images to Supabase Storage.
- Add edit, archive and publish actions for rooms.

### Phase 6: Email workflows

- Send booking inquiry receipt to guest.
- Send owner notification emails.
- Add booking confirmation, cancellation and payment emails.

### Phase 7: Deployment and ops

- Add Vercel environment variables.
- Connect Vercel to Supabase project.
- Add production domain for Resend sender verification.
- Run smoke tests after deploy.

## 5. High-Impact Features You Can Add Later

- Payments with Stripe
- Saved favorites / wishlist
- Guest reviews and ratings
- City/category landing pages for SEO
- Coupon and campaign management
- Admin analytics and property approval queue
- Multi-image galleries and room availability calendar
