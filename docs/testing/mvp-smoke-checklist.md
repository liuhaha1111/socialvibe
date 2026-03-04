# SocialVibe MVP Smoke Checklist

Date: 2026-03-04

## Preconditions

- Local Supabase Docker stack is running.
- Backend env vars are set:
  - `SUPABASE_URL` (recommended `http://127.0.0.1:28000`)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TEST_PROFILE_ID` (recommended `11111111-1111-1111-1111-111111111111`)
- DB migrations have been applied:
  - `npm --prefix backend run db:migrate`

## Backend checks

1. `GET /api/v1/health` returns `200` and `code=OK`.
2. `GET /api/v1/activities` returns list data.
3. `POST /api/v1/activities` creates a new activity.
4. `GET /api/v1/me/profile` returns current profile.
5. `PUT /api/v1/me/profile` persists updated profile fields.
6. `POST /api/v1/me/favorites/:activityId` creates favorite.
7. `GET /api/v1/me/favorites` includes that activity.
8. `DELETE /api/v1/me/favorites/:activityId` returns `204`.

## Frontend checks

1. Home loads activities from backend (no hardcoded list behavior).
2. Create page publishes an activity and it appears in Home.
3. Detail page displays backend-sourced activity info when opened from Home.
4. Saved page reflects favorite add/remove operations.
5. Settings saves profile changes and Profile shows updated values.
6. Refresh browser: created activity/profile edits/favorites remain persisted.
