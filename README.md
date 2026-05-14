# QuickStay Hotel Booking Website

QuickStay is a full-stack hotel booking platform built with Next.js, Supabase, Stripe, and transactional email support. It includes a public traveler experience, an owner management workspace, real booking creation, booking confirmation, online payment, payment recovery, and branded invoice access.

This repository is the active Next.js application. The older Vite app is preserved only as an archived reference under `legacy-vite/`.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase Auth, Database, and Storage
- Stripe Checkout
- SMTP via Nodemailer or Resend
- Zod validation
- Sonner toast notifications

## Core Features

### Traveler Features

- Browse publicly available hotel rooms from active hotels only
- View detailed room pages with pricing, amenities, and images
- Create an account and sign in to manage bookings
- Create real authenticated bookings tied to Supabase data
- View personal booking history on `/my-bookings`
- See booking status and payment status separately
- Pay confirmed bookings through Stripe Checkout
- Recover paid status if the initial return-sync moment is missed
- Download a branded QuickStay invoice for paid bookings
- Open the invoice directly from the payment confirmation email

### Owner Features

- Shared account flow for entering the owner area from `/host`
- Owner-only dashboard and protected owner routes
- Create and edit hotel details
- Publish or unpublish the hotel
- Create and edit rooms
- Upload room images to Supabase Storage
- Publish or unpublish rooms
- Review bookings for owner-managed rooms only
- Move bookings through supported status transitions:
  - `pending -> confirmed`
  - `pending -> cancelled`
  - `confirmed -> completed`
- Prevent completing a stay until payment is received

### Booking and Payment Features

- Real booking persistence in Supabase
- Booking conflict checks for overlapping pending or confirmed stays
- Database-level overlap protection through a dedicated migration
- Stripe Checkout session creation from confirmed unpaid bookings
- Payment status sync on Stripe return to `/my-bookings`
- Webhook support for Stripe payment updates
- Minimal Stripe audit metadata support:
  - provider
  - checkout session reference
  - payment intent id
  - paid timestamp
  - last payment event
  - last payment error
- Compatibility fallback for older databases that still only have legacy payment fields

### Email Features

- Traveler booking-created email
- Owner booking-created notification email
- Traveler booking status emails for confirmation, cancellation, and completion
- Traveler and owner payment confirmation emails
- Payment confirmation email includes a direct invoice link

## Project Structure

This project follows the repository rules in `AGENTS.md`.

```text
app/
  Next.js routes, layouts, page entrypoints, and route handlers only

src/frontend/
  UI screens, components, sections, client features, assets entrypoints

src/backend/
  Auth, config, repositories, services, validation, email, storage helpers

supabase/
  SQL migrations only

docs/
  Project documentation and roadmap

legacy-vite/
  Archived old app for reference only
```

## Main Routes

### Public / Traveler Routes

- `/` - home page
- `/rooms` - public rooms listing
- `/rooms/[id]` - room details and booking form
- `/create-account` - traveler sign-up
- `/login` - login
- `/sign-in` - sign-in screen
- `/sign-up` - sign-up screen
- `/forgot-password` - password reset request
- `/reset-password` - password reset completion
- `/my-bookings` - traveler booking dashboard
- `/my-bookings/invoices/[id]` - branded invoice page
- `/host` - owner access entry flow

### Owner Routes

- `/owner` - owner dashboard
- `/owner/setup-hotel` - hotel profile and visibility management
- `/owner/add-room` - create room
- `/owner/list-room` - room inventory and visibility
- `/owner/rooms/[id]/edit` - edit room
- `/owner/bookings` - owner booking desk

### API Routes

- `/api/bookings` - create a booking
- `/api/bookings/[id]/checkout` - start Stripe Checkout
- `/api/payments/stripe/webhook` - Stripe webhook endpoint
- `/api/booking-inquiry` - public inquiry flow
- `/api/newsletter` - newsletter signup flow

## Current Booking Workflow

### 1. Owner Setup

1. Owner signs in and opens `/owner/setup-hotel`
2. Owner creates or updates hotel details
3. Owner publishes the hotel
4. Owner adds rooms from `/owner/add-room`
5. Owner publishes at least one room from `/owner/list-room`

Only rooms that belong to an active hotel and are themselves active are shown to travelers.

### 2. Traveler Booking Flow

1. Traveler browses `/rooms`
2. Traveler opens a room details page
3. Traveler signs in or creates an account if needed
4. Traveler fills the booking form
5. Booking is created in Supabase with:
   - `status = pending`
   - `payment_status = unpaid`
6. Traveler receives a booking-created email
7. Owner receives a booking notification email

### 3. Owner Booking Review

1. Owner opens `/owner/bookings`
2. Owner confirms or cancels the booking
3. Traveler receives a status email
4. Once confirmed, the traveler sees `Pay now` on `/my-bookings`

### 4. Payment Flow

1. Traveler clicks `Pay now`
2. The app creates a Stripe Checkout session
3. Traveler completes payment on Stripe
4. Stripe returns the traveler to `/my-bookings`
5. The app syncs payment state and marks the booking as paid
6. Owner and traveler receive payment confirmation emails
7. The paid booking exposes a `Download invoice` action

### 5. Invoice Flow

1. Paid bookings show `Download invoice` on `/my-bookings`
2. The payment confirmation email also includes a direct invoice link
3. The invoice page uses a QuickStay-branded layout
4. The traveler can print or save the invoice as PDF from the browser print dialog

## Authentication and Access Rules

- Traveler booking history is tied to the authenticated traveler account
- Owner pages are protected and owner-scoped
- Owners only see bookings for rooms they manage
- Invoice pages are accessible through:
  - the authenticated traveler account that owns the booking, or
  - a signed invoice link generated by QuickStay

## Database and Migrations

All migrations live in `supabase/migrations/`.

Current migration files:

1. `20260410_initial_schema.sql`
2. `20260411_auth_readiness_rls.sql`
3. `20260412_profile_integrity_hardening.sql`
4. `20260413_profile_address_support.sql`
5. `20260414_room_image_storage.sql`
6. `20260423_owner_booking_management.sql`
7. `20260426_booking_payment_hardening.sql`

The latest payment hardening migration adds:

- Stripe payment audit columns
- payment reference uniqueness
- payment intent uniqueness
- database-level exclusion constraint for overlapping active stays

## Environment Variables

Create `.env.local` from `.env.example`.

| Variable | Required For | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | App | Base URL for links and redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Payments, server writes, invoices | Trusted server-side Supabase access |
| `SMTP_HOST` | SMTP email | SMTP server host |
| `SMTP_PORT` | SMTP email | SMTP server port |
| `SMTP_USER` | SMTP email | SMTP username |
| `SMTP_PASSWORD` | SMTP email | SMTP password |
| `SMTP_FROM_EMAIL` | SMTP email | Sender email address |
| `SMTP_FROM_NAME` | SMTP email | Sender display name |
| `SMTP_REPLY_TO_EMAIL` | SMTP email | Reply-to address |
| `RESEND_API_KEY` | Resend email | Resend API access |
| `RESEND_FROM_EMAIL` | Resend email | Resend sender address |
| `NOTIFICATION_EMAIL` | Fallback owner notifications | Backup notification email |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe UI integrations | Public Stripe key |
| `STRIPE_SECRET_KEY` | Stripe Checkout | Server-side Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Validates webhook payloads |

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- npm
- Supabase project
- Stripe test account
- SMTP provider or Resend account for email testing

### Install

```bash
npm install
```

### Configure environment

```bash
copy .env.example .env.local
```

Then fill in the values from your Supabase, Stripe, and email providers.

### Run the app

```bash
npm run dev
```

Local development URL:

```text
http://localhost:3000
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Start production build locally

```bash
npm run start
```

## Recommended Setup Order

1. Configure `.env.local`
2. Apply all Supabase migrations in order
3. Create at least one owner account
4. Create and publish a hotel
5. Create and publish a room
6. Create a traveler account
7. Make a test booking
8. Confirm it from the owner area
9. Pay with Stripe test mode
10. Open and save the generated invoice

## Manual Test Procedure

### Traveler Booking and Payment

1. Open `/rooms`
2. Open a public room
3. Sign in as traveler
4. Create a booking
5. Check `/my-bookings`
6. Confirm the booking from `/owner/bookings`
7. Refresh `/my-bookings`
8. Click `Pay now`
9. Complete Stripe payment
10. Return to `/my-bookings`
11. Confirm the booking now shows as paid
12. Click `Download invoice`

### Invoice Validation

1. Open a paid booking invoice
2. Confirm QuickStay branding, invoice number, traveler details, hotel details, charges, and totals
3. Use browser print
4. Save as PDF
5. Open the payment confirmation email
6. Use the invoice link from the email

## Notes on Payment Compatibility

- QuickStay supports a compatibility fallback if your database still has only legacy payment fields.
- The latest payment migration is still strongly recommended because it enables:
  - stronger audit metadata
  - retry-safe session recovery
  - improved invoice and payment tracking fidelity

## Deployment Notes

- The app is Vercel-ready
- Supabase should be connected for auth, database, and storage
- Stripe webhook configuration should point to:

```text
/api/payments/stripe/webhook
```

- Production email delivery should use a verified sender/domain

## Developer Notes

- Keep route files in `app/` thin
- Put UI in `src/frontend/`
- Put business logic in `src/backend/`
- Keep migrations inside `supabase/` only
- Do not treat `legacy-vite/` as active runtime code

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint ."
}
```

## Status

QuickStay currently supports the full happy-path flow for:

- public room discovery
- authenticated booking creation
- owner booking confirmation
- Stripe payment
- payment confirmation emails
- branded invoice download

For the broader migration context and roadmap, see `docs/PROJECT_ROADMAP.md`.
