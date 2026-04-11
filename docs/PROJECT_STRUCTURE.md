# Project Structure

This repository is now organized around the active Next.js app, a frontend/backend split under `src/`, Supabase SQL migrations, and an archived legacy Vite app kept only for reference.

## Top-Level Folders

- `app/`
  Next.js route groups, layouts, page entrypoints, and route handlers only.
- `src/frontend/`
  UI-facing code: screens, features, components, sections, content, and presentation utilities.
- `src/backend/`
  Server-oriented code: auth helpers, config, repositories, services, validation, and email helpers.
- `src/assets/`
  Physical image/icon asset files still used by the frontend asset entrypoint during the current migration state.
- `supabase/`
  Database migration files only.
- `legacy-vite/`
  Archived reference copy of the old Vite/React app. Not part of the active runtime.
- `docs/`
  Project documentation and migration notes.
- `public/`
  Static public files served directly by Next.js.

## Frontend Location Rules

Active frontend code lives under `src/frontend/`:

- `src/frontend/screens/`
  Page-level composition used by `app/` entrypoints.
- `src/frontend/features/`
  Feature-focused UI modules and client components.
- `src/frontend/components/`
  Reusable site, owner, and shared components.
- `src/frontend/sections/`
  Page sections such as the home hero.
- `src/frontend/content/`
  Demo content and frontend-owned navigation/content data.
- `src/frontend/assets/index.js`
  Frontend asset entrypoint used by active UI code.
- `src/frontend/lib/`
  Presentation-oriented helpers such as formatting and asset normalization.

## Backend Location Rules

Active backend code lives under `src/backend/`:

- `src/backend/auth/`
  Supabase auth clients, current-user/profile helpers, and route/page guards.
- `src/backend/config/`
  Environment/config helpers.
- `src/backend/repositories/`
  Data access and fallback repository logic.
- `src/backend/services/`
  Server-side business flow for route handlers.
- `src/backend/validation/`
  Zod schemas and request validation.
- `src/backend/email/`
  Email transport/helpers.

## Route Files

All active Next.js route files live under `app/`:

- `app/layout.js`
- `app/(site)/*`
- `app/(owner)/*`
- `app/api/*`
- `app/auth/*`

These files should stay thin and delegate UI/rendering to `src/frontend/` and server logic to `src/backend/`.

## Legacy / Reference-Only Areas

- `legacy-vite/`
  Old SPA implementation kept for visual and structural reference only.
- `legacy-vite/index.html`
  Archived Vite entry HTML.
- `legacy-vite/vite.config.js`
  Archived Vite config.

Do not treat `legacy-vite/` as active runtime code.

## Temporary Shims And Cleanup Notes

Some compatibility layers still exist intentionally and should remain until their importers are migrated:

- `lib/data.js`
  Temporary compatibility shim that re-exports repository reads from `src/backend/repositories/`.

Some legacy shims exist but should be considered cleanup candidates once no imports remain:

- `lib/env.js`
- `lib/resend.js`
- `lib/supabase/admin.js`
- `lib/supabase/browser.js`
- `lib/supabase/server.js`

Current asset state is transitional:

- physical asset files still live in `src/assets/`
- active frontend imports should go through `src/frontend/assets/index.js`
- `src/assets/assets.js` is now a legacy compatibility barrel and can be retired later after asset cleanup

## Practical Rule Of Thumb

- If it defines a route, layout, page entrypoint, or HTTP handler: put it in `app/`
- If it renders UI or supports presentation: put it in `src/frontend/`
- If it touches auth, data access, validation, services, or server logic: put it in `src/backend/`
- If it is old Vite-only code: keep it in `legacy-vite/`
