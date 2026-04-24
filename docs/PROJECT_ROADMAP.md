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
- Auth is not aligned with the target stack yet.
- The app was not reliably mobile responsive because many screens depended on fixed widths, wide tables and SPA layout assumptions.

### What is already improved since the audit

- Owner/auth route protection is now active for the management area.
- Owner-scoped hotel and room reads are now connected to authenticated Supabase data.
- Owners can now bootstrap their first hotel record from the owner area.
- Owners can now create draft rooms under their authenticated hotel context.
- Owners can now edit hotel details and toggle hotel public visibility.
- Public room reads now require both an active room and an active hotel context.
- Home page featured inventory now prefers real active public rooms before using demo fallback content.
- Active public rooms now support real authenticated booking creation into the `bookings` table.
- Booking creation now blocks overlapping date conflicts against existing pending or confirmed bookings for the same room.
- `/my-bookings` now reads real authenticated traveler bookings instead of demo fallback booking cards.
- Owners can now review real bookings for their own rooms and move bookings through the first safe status transitions.
- Booking lifecycle emails now send for booking creation and owner-driven booking status updates when Resend is configured.

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
- Home page featured stays now prefer live active public inventory, while demo content remains only as a safe backup.
- Add owner-specific queries for only that owner’s hotels and rooms.

### Phase 3: Auth and roles

- Add `/login`, `/create-account`, `/forgot-password`, and `/reset-password` flows with:
  - richer signup fields
  - Google sign-in
  - remember-me email convenience
  - secure reset-password recovery
- Add a shared `/host` owner-access entry path so:
  - logged-out users are guided into common auth first
  - guests can activate self-serve owner access from the same account
  - owners/admins are redirected into hotel setup or the owner dashboard automatically
- Create `guest`, `owner`, `admin` roles.
- Protect `/owner` routes with middleware and role checks.

### Phase 4: Booking engine

- Real authenticated booking creation foundation is complete for active public rooms.
- Availability checks now block overlapping pending/confirmed bookings for the same room.
- Traveler booking history now loads from real authenticated bookings on `/my-bookings`.
- Owner-side booking visibility is now live for owner-scoped rooms.
- Basic owner booking status updates now support `pending -> confirmed`, `pending -> cancelled`, and `confirmed -> completed`.
- Add payment state transitions.

### Phase 5: Owner workflows

- Hotel bootstrap/create flow is complete with cover image and amenity setup.
- Authenticated hotel edit flow is complete.
- Hotel publish / unpublish controls are complete.
- Authenticated draft room creation is complete.
- Authenticated room edit flow is complete.
- Room publish / unpublish controls are complete.
- Room image upload to Supabase Storage is complete.
- Add archive/delete actions for rooms.

### Phase 6: Email workflows

- Send booking-created email to traveler.
- Send new booking notification email to owner.
- Send booking confirmation, cancellation, and completion emails to traveler.
- Add booking inquiry receipt to guest.
- Add payment-related emails.

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
