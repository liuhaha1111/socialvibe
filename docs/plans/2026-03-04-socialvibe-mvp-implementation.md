# SocialVibe MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an integrated frontend + backend MVP where `Home`, `Detail`, `Create`, `Saved`, `Profile`, and `Settings` use real data persisted in local self-hosted Supabase.

**Architecture:** Keep the existing React app in `frontend/` and add a new Express BFF in `backend/`. The backend owns all Supabase service key usage and exposes `/api/v1` endpoints. Frontend contexts switch from in-memory mock state to API-backed state with optimistic UI only for favorites.

**Tech Stack:** React 19 + Vite (frontend), Node.js + Express + TypeScript + Supabase JS (backend), PostgreSQL (self-hosted Supabase), Vitest + Supertest (backend tests), Vitest + RTL (frontend context/API tests).

---

Execution skill references during implementation:
- `@superpowers/test-driven-development`
- `@superpowers/systematic-debugging`
- `@superpowers/verification-before-completion`
- `@superpowers/requesting-code-review`

### Task 1: Bootstrap backend service and health endpoint

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/tests/api/health.test.ts`

**Step 1: Write the failing test**

```ts
// backend/tests/api/health.test.ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("health", () => {
  it("GET /api/v1/health returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.code).toBe("OK");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- --run tests/api/health.test.ts`  
Expected: FAIL with module/file-not-found errors (`../../src/app` missing).

**Step 3: Write minimal implementation**

```ts
// backend/src/app.ts
import express from "express";

export const app = express();
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ code: "OK", message: "healthy", data: null });
});
```

```ts
// backend/src/server.ts
import { app } from "./app";

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`api listening on ${port}`));
```

**Step 4: Run test to verify it passes**

Run: `npm --prefix backend test -- --run tests/api/health.test.ts`  
Expected: PASS (`1 passed`).

**Step 5: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/vitest.config.ts backend/src/app.ts backend/src/server.ts backend/tests/api/health.test.ts
git commit -m "feat(backend): bootstrap express service with health endpoint"
```

### Task 2: Add backend env parsing and Supabase admin client

**Files:**
- Create: `backend/src/config/env.ts`
- Create: `backend/src/config/supabase.ts`
- Create: `backend/tests/config/env.test.ts`
- Modify: `backend/src/app.ts`

**Step 1: Write the failing test**

```ts
// backend/tests/config/env.test.ts
import { describe, it, expect } from "vitest";
import { parseEnv } from "../../src/config/env";

describe("parseEnv", () => {
  it("throws when required variables are missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrow(/SUPABASE_URL/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- --run tests/config/env.test.ts`  
Expected: FAIL because `parseEnv` does not exist yet.

**Step 3: Write minimal implementation**

```ts
// backend/src/config/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  TEST_PROFILE_ID: z.string().uuid(),
});

export type AppEnv = z.infer<typeof EnvSchema>;
export function parseEnv(raw: NodeJS.ProcessEnv): AppEnv {
  return EnvSchema.parse(raw);
}
```

```ts
// backend/src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { parseEnv } from "./env";

const env = parseEnv(process.env);
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix backend test -- --run tests/config/env.test.ts tests/api/health.test.ts`  
Expected: PASS (`2 passed`).

**Step 5: Commit**

```bash
git add backend/src/config/env.ts backend/src/config/supabase.ts backend/tests/config/env.test.ts backend/src/app.ts
git commit -m "feat(backend): add env validation and supabase admin client"
```

### Task 3: Create database migrations and schema smoke tests

**Files:**
- Create: `backend/db/migrations/001_mvp_schema.sql`
- Create: `backend/db/migrations/002_mvp_seed.sql`
- Create: `backend/scripts/db-migrate.mjs`
- Create: `backend/tests/db/schema.test.ts`
- Modify: `backend/package.json`

**Step 1: Write the failing schema test**

```ts
// backend/tests/db/schema.test.ts
import { describe, it, expect } from "vitest";
import { Client } from "pg";

describe("db schema", () => {
  it("has profiles, activities, favorites", async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const rs = await client.query(`
      select table_name from information_schema.tables
      where table_schema='public' and table_name in ('profiles','activities','favorites')
    `);
    await client.end();
    expect(rs.rows.length).toBe(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- --run tests/db/schema.test.ts`  
Expected: FAIL (`rows.length` is `0` or table missing).

**Step 3: Write minimal implementation (SQL + migrate runner)**

```sql
-- backend/db/migrations/001_mvp_schema.sql
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text not null,
  bio text,
  email text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  location text not null,
  start_time timestamptz not null,
  category text not null,
  description text,
  host_profile_id uuid not null references profiles(id),
  participant_count int not null default 1,
  max_participants int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_max_participants_chk check (max_participants >= 1),
  constraint activities_participant_count_chk check (participant_count >= 0 and participant_count <= max_participants)
);

create table if not exists favorites (
  profile_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, activity_id)
);

create index if not exists idx_activities_start_time on activities(start_time desc);
create index if not exists idx_activities_category on activities(category);
create index if not exists idx_favorites_profile_id on favorites(profile_id);
```

```sql
-- backend/db/migrations/002_mvp_seed.sql
insert into profiles (id, name, avatar_url, bio, email, location)
values
  ('11111111-1111-1111-1111-111111111111', 'Test User', 'https://example.com/avatar.png', 'MVP test profile', 'test@example.com', 'Shanghai')
on conflict (id) do update set
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  email = excluded.email,
  location = excluded.location;
```

```js
// backend/scripts/db-migrate.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const file of ["001_mvp_schema.sql", "002_mvp_seed.sql"]) {
  const sqlPath = path.join(process.cwd(), "db", "migrations", file);
  const sql = await fs.readFile(sqlPath, "utf8");
  await client.query(sql);
  console.log(`applied ${file}`);
}

await client.end();
```

**Step 4: Run migration and tests**

Run: `npm --prefix backend run db:migrate`  
Expected: output includes `applied 001_mvp_schema.sql` and `applied 002_mvp_seed.sql`.

Run: `npm --prefix backend test -- --run tests/db/schema.test.ts`  
Expected: PASS (`1 passed`).

**Step 5: Commit**

```bash
git add backend/db/migrations/001_mvp_schema.sql backend/db/migrations/002_mvp_seed.sql backend/scripts/db-migrate.mjs backend/tests/db/schema.test.ts backend/package.json
git commit -m "feat(db): add mvp schema, seed, and migration runner"
```

### Task 4: Implement activity read APIs (`GET /activities`, `GET /activities/:id`)

**Files:**
- Create: `backend/src/repositories/activityRepository.ts`
- Create: `backend/src/services/activityService.ts`
- Create: `backend/src/controllers/activityController.ts`
- Create: `backend/src/routes/activityRoutes.ts`
- Create: `backend/tests/api/activities.read.test.ts`
- Modify: `backend/src/app.ts`

**Step 1: Write failing API tests**

```ts
// backend/tests/api/activities.read.test.ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("activity read api", () => {
  it("GET /api/v1/activities returns array", async () => {
    const res = await request(app).get("/api/v1/activities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/activities/:id returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/v1/activities/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm --prefix backend test -- --run tests/api/activities.read.test.ts`  
Expected: FAIL (`Cannot GET /api/v1/activities`).

**Step 3: Write minimal implementation**

```ts
// backend/src/routes/activityRoutes.ts
import { Router } from "express";
import { getActivities, getActivityById } from "../controllers/activityController";

export const activityRoutes = Router();
activityRoutes.get("/", getActivities);
activityRoutes.get("/:id", getActivityById);
```

```ts
// backend/src/app.ts (snippet)
import { activityRoutes } from "./routes/activityRoutes";
app.use("/api/v1/activities", activityRoutes);
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix backend run db:migrate && npm --prefix backend test -- --run tests/api/activities.read.test.ts`  
Expected: PASS (`2 passed`).

**Step 5: Commit**

```bash
git add backend/src/repositories/activityRepository.ts backend/src/services/activityService.ts backend/src/controllers/activityController.ts backend/src/routes/activityRoutes.ts backend/src/app.ts backend/tests/api/activities.read.test.ts
git commit -m "feat(api): add activity list and detail endpoints"
```

### Task 5: Implement activity creation API (`POST /activities`) with validation

**Files:**
- Create: `backend/tests/api/activities.create.test.ts`
- Modify: `backend/src/controllers/activityController.ts`
- Modify: `backend/src/services/activityService.ts`
- Modify: `backend/src/repositories/activityRepository.ts`

**Step 1: Write failing tests**

```ts
// backend/tests/api/activities.create.test.ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("activity create api", () => {
  it("creates activity with valid payload", async () => {
    const payload = {
      title: "Sunset Walk",
      location: "Central Park",
      start_time: "2026-03-10T10:00:00.000Z",
      category: "City Walk",
      max_participants: 8,
      description: "test create",
      image_url: "https://example.com/a.png"
    };
    const res = await request(app).post("/api/v1/activities").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe(payload.title);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/v1/activities").send({ location: "x" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("BAD_REQUEST");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- --run tests/api/activities.create.test.ts`  
Expected: FAIL (`Cannot POST /api/v1/activities` or validation not implemented).

**Step 3: Write minimal implementation**

```ts
// backend/src/controllers/activityController.ts (snippet)
const CreateActivitySchema = z.object({
  title: z.string().min(1).max(80),
  location: z.string().min(1).max(120),
  start_time: z.string().datetime(),
  category: z.string().min(1),
  description: z.string().max(1000).optional().default(""),
  image_url: z.string().url().optional().default(""),
  max_participants: z.number().int().min(2).max(100),
});
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix backend run db:migrate && npm --prefix backend test -- --run tests/api/activities.create.test.ts`  
Expected: PASS (`2 passed`).

**Step 5: Commit**

```bash
git add backend/tests/api/activities.create.test.ts backend/src/controllers/activityController.ts backend/src/services/activityService.ts backend/src/repositories/activityRepository.ts
git commit -m "feat(api): add activity creation endpoint with validation"
```

### Task 6: Implement profile APIs (`GET /me/profile`, `PUT /me/profile`)

**Files:**
- Create: `backend/src/repositories/profileRepository.ts`
- Create: `backend/src/services/profileService.ts`
- Create: `backend/src/controllers/profileController.ts`
- Create: `backend/src/routes/profileRoutes.ts`
- Create: `backend/tests/api/profile.test.ts`
- Modify: `backend/src/app.ts`

**Step 1: Write failing tests**

```ts
// backend/tests/api/profile.test.ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("profile api", () => {
  it("returns current profile", async () => {
    const res = await request(app).get("/api/v1/me/profile");
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("updates profile fields", async () => {
    const res = await request(app).put("/api/v1/me/profile").send({ name: "Updated Name", location: "Pudong" });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm --prefix backend test -- --run tests/api/profile.test.ts`  
Expected: FAIL (`Cannot GET /api/v1/me/profile`).

**Step 3: Write minimal implementation**

```ts
// backend/src/routes/profileRoutes.ts
import { Router } from "express";
import { getMeProfile, updateMeProfile } from "../controllers/profileController";

export const profileRoutes = Router();
profileRoutes.get("/profile", getMeProfile);
profileRoutes.put("/profile", updateMeProfile);
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix backend run db:migrate && npm --prefix backend test -- --run tests/api/profile.test.ts`  
Expected: PASS (`2 passed`).

**Step 5: Commit**

```bash
git add backend/src/repositories/profileRepository.ts backend/src/services/profileService.ts backend/src/controllers/profileController.ts backend/src/routes/profileRoutes.ts backend/tests/api/profile.test.ts backend/src/app.ts
git commit -m "feat(api): add current profile read and update endpoints"
```

### Task 7: Implement favorite APIs (`GET/POST/DELETE /me/favorites`)

**Files:**
- Create: `backend/src/repositories/favoriteRepository.ts`
- Create: `backend/src/services/favoriteService.ts`
- Create: `backend/src/controllers/favoriteController.ts`
- Create: `backend/src/routes/favoriteRoutes.ts`
- Create: `backend/tests/api/favorites.test.ts`
- Modify: `backend/src/app.ts`

**Step 1: Write failing tests**

```ts
// backend/tests/api/favorites.test.ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app";

describe("favorites api", () => {
  it("adds favorite, lists it, removes it", async () => {
    const list = await request(app).get("/api/v1/activities");
    const activityId = list.body.data[0].id;

    const add = await request(app).post(`/api/v1/me/favorites/${activityId}`);
    expect(add.status).toBe(201);

    const saved = await request(app).get("/api/v1/me/favorites");
    expect(saved.status).toBe(200);
    expect(saved.body.data.some((x: { id: string }) => x.id === activityId)).toBe(true);

    const del = await request(app).delete(`/api/v1/me/favorites/${activityId}`);
    expect(del.status).toBe(204);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm --prefix backend test -- --run tests/api/favorites.test.ts`  
Expected: FAIL (`Cannot POST /api/v1/me/favorites/:activityId`).

**Step 3: Write minimal implementation**

```ts
// backend/src/routes/favoriteRoutes.ts
import { Router } from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController";

export const favoriteRoutes = Router();
favoriteRoutes.get("/favorites", getFavorites);
favoriteRoutes.post("/favorites/:activityId", addFavorite);
favoriteRoutes.delete("/favorites/:activityId", removeFavorite);
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix backend run db:migrate && npm --prefix backend test -- --run tests/api/favorites.test.ts`  
Expected: PASS (`1 passed`).

**Step 5: Commit**

```bash
git add backend/src/repositories/favoriteRepository.ts backend/src/services/favoriteService.ts backend/src/controllers/favoriteController.ts backend/src/routes/favoriteRoutes.ts backend/tests/api/favorites.test.ts backend/src/app.ts
git commit -m "feat(api): add favorite list/create/delete endpoints"
```

### Task 8: Frontend API client + Vite proxy wiring

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/api.test.ts`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/setupTests.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`

**Step 1: Write failing test for API wrapper**

```ts
// frontend/lib/api.test.ts
import { describe, it, expect, vi } from "vitest";
import { apiGet } from "./api";

describe("apiGet", () => {
  it("throws with backend message on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "boom" })
    }));
    await expect(apiGet("/api/v1/fail")).rejects.toThrow("boom");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- --run frontend/lib/api.test.ts`  
Expected: FAIL (no frontend test setup / no api module).

**Step 3: Write minimal implementation**

```ts
// frontend/lib/api.ts
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body.data as T;
}
```

```ts
// frontend/vite.config.ts (snippet)
server: {
  port: 3000,
  host: "0.0.0.0",
  proxy: {
    "/api": {
      target: "http://localhost:4000",
      changeOrigin: true
    }
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm --prefix frontend test -- --run frontend/lib/api.test.ts`  
Expected: PASS (`1 passed`).

**Step 5: Commit**

```bash
git add frontend/lib/api.ts frontend/lib/api.test.ts frontend/vitest.config.ts frontend/setupTests.ts frontend/package.json frontend/vite.config.ts
git commit -m "feat(frontend): add api wrapper and dev proxy for backend"
```

### Task 9: Replace ActivityContext + related pages with backend data flow

**Files:**
- Modify: `frontend/context/ActivityContext.tsx`
- Modify: `frontend/pages/Home.tsx`
- Modify: `frontend/pages/Detail.tsx`
- Modify: `frontend/pages/Create.tsx`
- Modify: `frontend/pages/Saved.tsx`
- Create: `frontend/context/ActivityContext.test.tsx`

**Step 1: Write failing context behavior test**

```tsx
// frontend/context/ActivityContext.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ActivityProvider, useActivity } from "./ActivityContext";

describe("ActivityContext", () => {
  it("loads remote activities on init", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "OK", message: "ok", data: [{ id: "a1", title: "A", location: "L", image_url: "", start_time: "2026-03-10T00:00:00Z", category: "City", participant_count: 1, max_participants: 8 }] })
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => <ActivityProvider>{children}</ActivityProvider>;
    const { result } = renderHook(() => useActivity(), { wrapper });
    await waitFor(() => expect(result.current.activities.length).toBe(1));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- --run frontend/context/ActivityContext.test.tsx`  
Expected: FAIL (context still local-only mock array).

**Step 3: Write minimal implementation**

```ts
// frontend/context/ActivityContext.tsx (key behavior)
useEffect(() => {
  apiGet<ActivityDto[]>("/api/v1/activities")
    .then(setActivities)
    .catch(console.error);
}, []);
```

**Step 4: Run tests and quick page checks**

Run: `npm --prefix frontend test -- --run frontend/context/ActivityContext.test.tsx`  
Expected: PASS.

Run: `npm --prefix frontend run build`  
Expected: SUCCESS build output.

**Step 5: Commit**

```bash
git add frontend/context/ActivityContext.tsx frontend/pages/Home.tsx frontend/pages/Detail.tsx frontend/pages/Create.tsx frontend/pages/Saved.tsx frontend/context/ActivityContext.test.tsx
git commit -m "feat(frontend): wire activity pages to backend apis"
```

### Task 10: Replace UserContext + profile/settings pages and run MVP smoke checks

**Files:**
- Modify: `frontend/context/UserContext.tsx`
- Modify: `frontend/pages/Profile.tsx`
- Modify: `frontend/pages/Settings.tsx`
- Create: `frontend/context/UserContext.test.tsx`
- Create: `docs/testing/mvp-smoke-checklist.md`
- Modify: `frontend/README.md`

**Step 1: Write failing UserContext test**

```tsx
// frontend/context/UserContext.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { UserProvider, useUser } from "./UserContext";

describe("UserContext", () => {
  it("loads profile from backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "OK", message: "ok", data: { id: "11111111-1111-1111-1111-111111111111", name: "Test User", avatar_url: "", bio: "", email: "", location: "Shanghai" } })
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.user.name).toBe("Test User"));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- --run frontend/context/UserContext.test.tsx`  
Expected: FAIL (still local default user).

**Step 3: Write minimal implementation**

```ts
// frontend/context/UserContext.tsx (key behavior)
useEffect(() => {
  apiGet<UserProfile>("/api/v1/me/profile").then(setUser).catch(console.error);
}, []);

const updateUser = async (updates: Partial<UserProfile>) => {
  const next = await apiPut<UserProfile>("/api/v1/me/profile", updates);
  setUser(next);
};
```

**Step 4: Run full verification**

Run: `npm --prefix backend run db:migrate`  
Expected: migrations applied without error.

Run: `npm --prefix backend test`  
Expected: all backend tests PASS.

Run: `npm --prefix frontend test`  
Expected: all frontend tests PASS.

Run: `npm --prefix frontend run build`  
Expected: build SUCCESS.

Manual smoke (document in `docs/testing/mvp-smoke-checklist.md`):
- Home loads remote activities.
- Create creates and appears in Home.
- Detail loads by ID.
- Saved add/remove persists.
- Profile/Settings edits persist across refresh.

**Step 5: Commit**

```bash
git add frontend/context/UserContext.tsx frontend/pages/Profile.tsx frontend/pages/Settings.tsx frontend/context/UserContext.test.tsx docs/testing/mvp-smoke-checklist.md frontend/README.md
git commit -m "feat(frontend): wire profile/settings to backend and add mvp smoke docs"
```

### Final verification gate (before claiming done)

Run from repo root:

1. `npm --prefix backend run db:migrate`
2. `npm --prefix backend test`
3. `npm --prefix frontend test`
4. `npm --prefix frontend run build`

Expected:
- all commands exit `0`
- no failing tests
- no TypeScript build errors

Only after this gate passes, use `@superpowers/verification-before-completion` and then `@superpowers/requesting-code-review`.
