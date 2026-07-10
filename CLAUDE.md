# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **bun** (see `bun.lock`, `packageManager` in package.json).

- `bun install` — install dependencies
- `bun run dev` — start Vite dev server
- `bun run build` — typecheck (`tsc -b`) then production build
- `bun run lint` — ESLint over the whole repo
- `bun run format` / `bun run format:check` — Prettier write/check
- `bun run preview` — preview the production build

No test runner is configured in this repo.

Content scripts (Supabase course content):
- `bun run export:original-courses` — `scripts/export-original-course-content.mjs`, dumps original course content to `docs/original-course-content.json`
- `bun run import:course-content` — `scripts/import-course-content-to-supabase.mjs`, pushes that content into Supabase

## Architecture

Single Vite + React 19 + TypeScript SPA (no SSR/meta-framework), deployed to Vercel with a catch-all rewrite (`vercel.json`) since routing is entirely client-side via `react-router-dom`.

### Two apps in one bundle

`src/App.tsx` mounts two independent route trees under one `<Routes>`:
- **Public marketing site** (`/`, `/cursos-trekform`, `/inscripciones`, `/blog`, `/contacto`, etc.) wrapped in a shared `PublicLayout` (`StaticHeader`/`StaticFooter`). Pages live in `src/pages/`, data access in `src/services/`.
- **Admin panel** at `/panel/*`, entirely delegated to `src/panel/PanelApp.tsx`, which owns its own nested `<Routes>`, layout (`src/panel/layouts`), auth (`src/panel/contexts/AuthContext.tsx`), and CRUD pages per resource (`src/panel/pages/{courses,sessions,blog,enrollments,users}`). The panel was merged into the main site under `/panel` in a single deploy — it is not a separate app/build.

Panel routes are gated by `ProtectedRoute` (`src/panel/components`), which relies on `AuthContext` reading the Supabase session and the caller's `profiles.role`. Only `role = 'admin'` (and `is_active`) is treated as authorized; `student`/`company` roles exist in the schema but have no panel access yet.

### Supabase is the only backend

- Client: `src/lib/supabase.ts` builds a typed client from `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`). The client is `null` when env vars are missing — every call site must check for `null` and throw/handle before querying (this is deliberate, not a bug).
- Migrations live in `supabase/migrations/`, but the tracked files are **not a reliable picture of the live schema** — several files are wrapped in `/* ... */` (dead, kept only as history: `docs/backend-mvp.md` explains which chain is "active") and, separately, the live `courses`/`course_modules` tables have extra columns (`short_title`, `objectives`, `audience_description`, `methodology`, `sidebar_*`, `hero_text`, `featured_image_url`, `description`/`sort_order` on modules, etc.) that were added directly against the remote database and were never captured in a migration file at all. Don't infer the live schema by reading migrations or `database.generated.ts` — both can be stale. To check the real thing: `curl "$VITE_SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Accept: application/openapi+json"` (keys in `.env.local`) returns PostgREST's live OpenAPI schema; query a row with `select=*` to see what's actually populated.
- `src/types/database.generated.ts` (the only half of `src/types/database.ts` that's actually live — see below) is generated from an older snapshot of the schema and is missing those extra columns. Don't trust its `courses`/`course_modules`/`course_sessions` shapes; `src/services/courses.ts` was hand-written against the real live columns (verified via the OpenAPI introspection above), not against this file.
- All public tables have RLS; anonymous users can only read published content and insert contact requests. Never expose the service role key client-side — service-role operations belong in Supabase Edge Functions (e.g. Stripe webhook confirmation, certificate issuance), not the frontend.

### `database.ts` vs `database.generated.ts`

`src/types/database.ts` is a stub that just re-exports `database.generated.ts` — it also contains a large commented-out block, kept only because the OneDrive-synced file can't be deleted in place. Ignore that commented block; it's an old snapshot, not a live/dead schema signal either way.

### Course content: schema is fine, seed data isn't

`courses` has full content for all 54 published rows (objectives, audience, methodology, sidebar copy, certification flags — all populated, confirmed live). What's actually missing is **`course_modules`/`course_sessions` rows**: only the original 4 MVP-seeded courses (`curso-de-carretillas-elevadoras`, `curso-de-plataformas-elevadoras-pemp`, `curso-de-trabajos-en-altura`, `curso-de-espacios-confinados`) have a program/temario and real convocatorias. The other 50 published courses have zero rows in both tables, so `CourseDetailPage` correctly hides the "Programa formativo" section and falls back to a generic CTA under "Próximas convocatorias" for them — that's the page working as designed against incomplete data, not a bug.

### Styling

Plain CSS (`src/styles.css` + colocated component styles), no Tailwind/CSS-in-JS. Design tokens are CSS custom properties on `:root` (`--navy`, `--accent`, `--surface`, etc.) — reuse these instead of hardcoding colors.
