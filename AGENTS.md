# AGENTS

## Structure Rules

- `app/`
  Keep only Next.js routes, layouts, page entrypoints, and route handlers here.
  These files should stay thin and delegate UI to `src/frontend/` and server logic to `src/backend/`.

- `src/frontend/`
  Put screens, features, components, sections, content, frontend assets entrypoints, and presentation utilities here.
  If code is primarily about rendering, interaction, or UI composition, it belongs in `src/frontend/`.

- `src/backend/`
  Put auth, config, repositories, services, validation, email, and storage helpers here.
  If code is server-oriented or business/data logic, it belongs in `src/backend/`.

- `supabase/`
  Keep migrations only.

- `legacy-vite/`
  Archived reference-only old app.
  Do not treat it as active runtime code.

- `docs/`
  Project documentation only.

## Change Discipline

- Make changes in small, safe batches.
- Prefer cleanup and refactors in narrowly scoped steps.
- Do not mix unrelated structural, frontend, and backend changes in one batch unless necessary.

## Verification

- Run `npm run lint` after each code batch.
- Run `npm run build` after each code batch.
- If a batch is documentation-only, note that runtime checks were not needed.

## Compatibility Shims

- Temporary shims are allowed during migration.
- Do not remove compatibility shims until they are no longer referenced.
- Before deleting a shim, verify imports across `app/`, `src/frontend/`, `src/backend/`, and `lib/`.

## Practical Defaults

- Preserve current behavior unless the batch explicitly changes behavior.
- Prefer server-side protection and route-level guards for access control.
- Keep `app/` as the source of routing, not the source of business logic or UI complexity.
