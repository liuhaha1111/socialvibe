# SocialVibe

SocialVibe is a TypeScript monorepo with:
- `frontend/`: Vite + React client
- `backend/`: Express API
- `supabase-project/`: local Supabase Docker stack config

## Repository Layout

```text
socialvibe/
|- frontend/                # Frontend app (Vite + React)
|- backend/                 # Backend API (Express + TypeScript)
|- supabase-project/        # Local Supabase stack config
|- docs/                    # Deployment, testing, and plan docs
|- openspec/                # Change specs and tasks
`- AGENTS.md                # Collaboration and execution rules
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Docker Desktop (for local Supabase)

## Quick Start (Local Development)

1. Install dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

2. Configure environment files

- Frontend:
  - Copy `frontend/.env.example` to `frontend/.env.local`
- Backend:
  - Copy `backend/.env.example` to `backend/.env`

Key variables:
- `backend/.env`
  - `PORT=4000`
  - `SUPABASE_URL=http://127.0.0.1:28000`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
- `frontend/.env.local`
  - `VITE_API_PROXY_TARGET=http://127.0.0.1:4000`
  - `VITE_API_BASE_URL=` (can be empty in local)
  - `VITE_SUPABASE_URL=http://127.0.0.1:28000`
  - `VITE_SUPABASE_ANON_KEY=...`

3. Start local Supabase (run inside `supabase-project/`)

```bash
npx supabase start
```

4. Apply database migrations

```bash
npm --prefix backend run db:migrate
```

5. Start backend and frontend

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Default URLs:
- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:4000/api/v1/health`

## Common Commands

```bash
# Frontend
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend test

# Backend
npm --prefix backend run dev
npm --prefix backend run build
npm --prefix backend test
npm --prefix backend run db:migrate
```

## Docs and Checks

- Smoke checklist: `docs/testing/mvp-smoke-checklist.md`
- Deployment runbook: `docs/deployment/railway-runbook.md`
- Design and implementation records: `docs/plans/`

## Suggested Git Commit Flow

1. Check current changes

```bash
git status
```

2. Sync with main (recommended)

```bash
git pull origin main
```

3. Create a branch (if still on `main`)

```bash
git checkout -b docs/add-root-readme
```

4. Stage changes

```bash
git add README.md
```

5. Commit (Conventional Commit style)

```bash
git commit -m "docs: add root readme with setup and git workflow"
```

6. Push branch

```bash
git push -u origin docs/add-root-readme
```

7. Open a PR to `main` with:
- change summary
- affected areas (`frontend`, `backend`, `docs`)
- verification commands used

## Security Notes

- Never commit real secrets or credentials.
- Keep migration files append-only; do not rewrite applied migrations.

