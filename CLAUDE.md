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
- Migrations live in `supabase/migrations/`, but the tracked files are **not a reliable picture of the live schema** — several files are wrapped in `/* ... */` (dead, kept only as history: `docs/backend-mvp.md` explains which chain is "active") and, separately, the live `courses`/`course_modules` tables have extra columns (`short_title`, `objectives`, `audience_description`, `methodology`, `sidebar_*`, `hero_text`, `featured_image_url`, `description`/`sort_order` on modules, etc.) that were added directly against the remote database and were never captured in a migration file at all. Don't infer the live schema by reading migrations or `database.generated.ts` — both can be stale. To check the real thing: `curl "$VITE_SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Accept: application/openapi+json"` (keys in `.env`, not `.env.local` — that file doesn't exist in this repo) returns PostgREST's live OpenAPI schema; query a row with `select=*` to see what's actually populated.
- `src/types/database.generated.ts` is generated from an older snapshot of the schema and is missing those extra columns. Don't trust its `courses`/`course_modules`/`course_sessions` shapes; `src/services/courses.ts` was hand-written against the real live columns (verified via the OpenAPI introspection above), not against this file.
- All public tables have RLS. Anonymous users can read published content, insert `contact_requests`, and — as of the `20260715*` migrations — also insert into `students` and `enrollments` directly (self-service course enrollment with simulated payment, no auth required to sign up). Don't assume enrollment writes need an authenticated session or a service-role Edge Function; check the current `enrollments_public_insert`/`students_public_insert` policies in `supabase/migrations/2026071511*` before changing that flow. Never expose the service role key client-side — service-role operations belong in Supabase Edge Functions (e.g. Stripe webhook confirmation, certificate issuance), not the frontend.

### Course content: schema and seed data are now both populated

`courses` has full content for all published rows (objectives, audience, methodology, sidebar copy, certification flags — all populated, confirmed live). `course_modules`/`course_sessions` were originally seeded only for the 4 MVP courses; `supabase/migrations/20260710120000_expand_course_content.sql` backfilled both tables for every other published course that had none yet (generic 3-module program + one `EXP-00xx`-coded session each). Verified live via PostgREST: 50 of 52 published courses have rows in both `course_modules` (150 rows total) and `course_sessions` (52 rows total). Don't assume most courses lack a program/temario or convocatorias — that's no longer true. Per-course coverage can drift as more real sessions get added on top of the backfill, so re-check live (or read that migration) rather than trusting an exact count here.

`src/pages/CoursesPage.tsx`'s catalog cards show real "Próx. fechas" sourced from `course_sessions` (via `getRegistrationSessions()`, grouped into `sessionsByCourseSlug`), with a "Próximamente" fallback when a course has none. `getCourseMeta()` (~line 66) still fabricates `city`/`certificate`/`bonificable`/`modality` placeholders derived from the course index — those aren't wired to real data yet, only the dates were fixed.

### Styling

Plain CSS (`src/styles.css` + colocated component styles), no Tailwind/CSS-in-JS. Design tokens are CSS custom properties on `:root` (`--navy`, `--accent`, `--surface`, etc.) — reuse these instead of hardcoding colors.
