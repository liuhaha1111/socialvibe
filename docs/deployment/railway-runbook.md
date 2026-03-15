# Railway Deployment Runbook

## 1) Service Layout

Create two Railway services from the same repository:

- Backend service
  - Root Directory: `backend`
  - Build Command: `npm run build`
  - Start Command: `npm run start`
- Frontend service
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Start Command: `npm run start`

## 2) Required Environment Variables

Backend service:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ALLOWED_ORIGINS` (comma-separated, include frontend production URL)
- `PORT` (Railway usually injects automatically)

Frontend service:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (backend public URL, e.g. `https://socialvibe-api.up.railway.app`)

## 3) Post-Deploy Smoke Checklist

- Open frontend URL and verify sign-in flow works.
- Open browser network tab and confirm API calls go to `VITE_API_BASE_URL`.
- Verify backend health endpoint returns 200: `/api/v1/health`.
- Verify profile read/update works.
- Verify activity list/create works.
- Verify favorites add/remove works.
- Verify chat conversations/messages load and send works.

## 4) Operations

- Configure Railway health check for backend: `/api/v1/health`.
- Enable deployment notifications and error alerts.
- Keep `main` branch as deployment source and require CI checks before merge.

