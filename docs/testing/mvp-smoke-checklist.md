# SocialVibe MVP Smoke Checklist

Date: 2026-03-04

## Preconditions

- Local Supabase Docker stack is running.
- Backend env vars are set:
  - `SUPABASE_URL` (recommended `http://127.0.0.1:28000`)
  - `SUPABASE_SERVICE_ROLE_KEY`
- Frontend env vars are set:
  - `VITE_SUPABASE_URL` (same host as backend Supabase URL)
  - `VITE_SUPABASE_ANON_KEY`
- DB migrations have been applied:
  - `npm --prefix backend run db:migrate`
- User has completed sign up/sign in and frontend sends `Authorization: Bearer <access_token>`.

## Backend checks

1. `GET /api/v1/health` returns `200` and `code=OK`.
2. `GET /api/v1/activities` with bearer token returns list data.
3. `POST /api/v1/activities` with bearer token creates a new activity.
4. `GET /api/v1/me/profile` with bearer token returns current profile (creates default profile on first access if needed).
5. `PUT /api/v1/me/profile` with bearer token persists updated profile fields.
6. `POST /api/v1/me/favorites/:activityId` with bearer token creates favorite.
7. `GET /api/v1/me/favorites` with bearer token includes that activity.
8. `DELETE /api/v1/me/favorites/:activityId` with bearer token returns `204`.

## Frontend checks

1. Home loads activities from backend (no hardcoded list behavior).
2. Create page publishes an activity and it appears in Home.
3. Detail page displays backend-sourced activity info when opened from Home.
4. Saved page reflects favorite add/remove operations.
5. Settings saves profile changes and Profile shows updated values.
6. Refresh browser: created activity/profile edits/favorites remain persisted.
