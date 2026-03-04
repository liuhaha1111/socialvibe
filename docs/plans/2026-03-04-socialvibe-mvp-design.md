# SocialVibe MVP Full-Stack Design

- Date: 2026-03-04
- Scope: MVP
- Backend style: Node.js + Express (BFF)
- Database: Self-hosted Supabase (local Docker)
- Auth mode (MVP): Single fixed test profile (no real login yet)
- Frontend pages in scope: `Home`, `Detail`, `Create`, `Saved`, `Profile`, `Settings`

## 1. Architecture

### 1.1 Overall structure

- `frontend/`: existing React app, refactored to call backend APIs.
- `backend/`: new Express service as BFF.
- `supabase-project/`: local Supabase stack as the only persistent store.

Request path:

`Frontend -> Express API -> Supabase (Postgres)`

Sensitive keys (for example Supabase service role key) stay only in backend env vars.

### 1.2 Backend module boundaries

- `routes`: HTTP route mapping.
- `controllers`: request validation and response formatting.
- `services`: business rules and orchestration.
- `repositories`: Supabase data access.
- `config`: env parsing and Supabase client setup.

This keeps API behavior explicit and leaves a clean path for future auth, chat, and check-in features.

## 2. Database Design (Supabase/Postgres)

### 2.1 Table: `profiles`

- `id uuid primary key`
- `name text not null`
- `avatar_url text not null`
- `bio text`
- `email text`
- `location text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### 2.2 Table: `activities`

- `id uuid primary key`
- `title text not null`
- `image_url text`
- `location text not null`
- `start_time timestamptz not null`
- `category text not null`
- `description text`
- `host_profile_id uuid not null references profiles(id)`
- `participant_count int not null default 1`
- `max_participants int not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### 2.3 Table: `favorites`

- `profile_id uuid not null references profiles(id)`
- `activity_id uuid not null references activities(id)`
- `created_at timestamptz default now()`
- Primary key: `(profile_id, activity_id)` (prevents duplicate favorites)

### 2.4 Indexes and constraints

- Index on `activities(start_time desc)` for home feed.
- Index on `activities(category)` for category filtering.
- Index on `favorites(profile_id)` for saved page loading.
- Check: `activities.max_participants >= 1`
- Check: `activities.participant_count >= 0 and activities.participant_count <= activities.max_participants`

### 2.5 Seed data

- Insert one fixed test profile (`profile_id` known by backend config).
- Insert several activities for immediate homepage visibility.

## 3. API Design and Data Flow

Base prefix: `/api/v1`

### 3.1 Activity APIs

- `GET /activities`
  - Purpose: home feed.
  - Query params: `q`, `category`, `sort` (default by `start_time`).
  - Returns card-level fields plus `is_favorite` for current test profile.

- `GET /activities/:id`
  - Purpose: detail page.
  - Returns activity detail plus host profile.

- `POST /activities`
  - Purpose: create page publish action.
  - Input: title, category, start_time, location, description, max_participants, image_url.
  - Rule: `participant_count` starts at `1` (host counted in).

### 3.2 Profile APIs

- `GET /me/profile`
  - Purpose: profile/settings initial load.

- `PUT /me/profile`
  - Purpose: persist profile edits from settings page.

### 3.3 Favorite APIs

- `GET /me/favorites`
  - Purpose: saved page list.

- `POST /me/favorites/:activityId`
  - Purpose: add favorite.

- `DELETE /me/favorites/:activityId`
  - Purpose: remove favorite.

### 3.4 Frontend integration changes

- `ActivityContext`: switch from local in-memory list to API-backed state and cache.
- `UserContext`: switch from local default profile to `/me/profile` read/write.
- Add optimistic favorite toggle with rollback on API failure.

## 4. Validation, Error Handling, and Acceptance

### 4.1 Response and error contract

Unified response envelope:

`{ code, message, data }`

Status behavior:

- `400`: invalid input.
- `404`: resource not found.
- `409`: conflict (for example duplicate favorite).
- `500`: unexpected server error (internal details hidden).

### 4.2 Server-side validation rules

- `title`: 1 to 80 chars
- `location`: 1 to 120 chars
- `description`: max 1000 chars
- `max_participants`: 2 to 100
- `start_time`: valid ISO datetime
- `category`: required non-empty string

### 4.3 MVP acceptance criteria

1. `Home` loads activities from Supabase and supports search/category filtering.
2. `Create` can publish and newly created activity appears in home list.
3. `Detail` can fetch real data by activity ID.
4. `Saved` supports add/remove favorite and persists correctly.
5. `Profile/Settings` persists updates and survives page refresh.
6. Data persists after restarting frontend/backend services.

### 4.4 Minimum verification set

- API smoke coverage for all 8 endpoints.
- Manual frontend regression for 6 scoped pages.
- Constraint checks for invalid input and duplicate favorite behavior.

## Out of Scope (MVP)

- Real auth/login flow.
- Chat persistence and realtime messages.
- Check-in and review business flows.

## Next Step

Use `writing-plans` skill to produce an implementation plan from this approved design.
