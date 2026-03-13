# Repository Guidelines

## Project Structure & Module Organization
This monorepo has two TypeScript apps:
- `frontend/`: Vite + React client. Main areas: `pages/`, `components/`, `context/`, `lib/`.
- `backend/`: Express API. Main areas: `src/controllers/`, `src/services/`, `src/repositories/`, `src/routes/`, `src/config/`.

Supporting folders:
- `backend/tests/`: API, service, DB, and config tests.
- `backend/db/migrations/`: SQL schema and seed migrations.
- `supabase-project/`: local Supabase stack config.
- `docs/` and `openspec/`: plans, specs, and implementation notes.

## Build, Test, and Development Commands
Run commands from repository root:
- `npm --prefix frontend install` / `npm --prefix backend install`: install dependencies.
- `npm --prefix frontend run dev`: start frontend dev server.
- `npm --prefix backend run dev`: start backend in watch mode.
- `npm --prefix frontend run build`: production frontend build.
- `npm --prefix backend run build`: compile backend to `backend/dist/`.
- `npm --prefix frontend test` / `npm --prefix backend test`: run Vitest suites.
- `npm --prefix backend run db:migrate`: apply backend DB migrations.

## Coding Style & Naming Conventions
- Language: TypeScript (ES modules) across frontend and backend.
- Indentation: 2 spaces; keep existing quote style and formatting in touched files.
- React: function components with `PascalCase` filenames (e.g., `ChatList.tsx`).
- Backend modules: `camelCase` file names by layer (e.g., `profileService.ts`, `activityRoutes.ts`).
- Prefer clear, small functions and typed inputs/outputs; validate external input with `zod`.

## Testing Guidelines
- Framework: Vitest in both apps; frontend uses Testing Library, backend uses `supertest` for API tests.
- Test file naming: `*.test.ts` / `*.test.tsx` and text-focused frontend tests as `*.text.test.tsx`.
- Add/adjust tests for every behavior change (especially routes, services, and page state logic).
- Run targeted tests first, then full suite before opening a PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history, for example:
  - `feat(api): add activity creation endpoint`
  - `feat(frontend): wire profile to backend`
  - `docs: add implementation plan`
- Keep commits scoped and atomic; avoid mixing backend/frontend refactors in one commit.
- PRs should include: summary, affected areas, test evidence (commands + result), linked issue/spec, and screenshots/GIFs for UI changes.

## Security & Configuration Tips
- Never commit secrets. Use `frontend/.env.local` and backend env files for credentials.
- Ensure Supabase URL/keys and API proxy settings are configured before local runs.
- Treat migration files as append-only; create new migration files instead of rewriting applied ones.
