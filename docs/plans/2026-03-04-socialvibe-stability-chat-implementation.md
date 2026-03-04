# SocialVibe Stability + Chat Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix current stability bugs (garbled text, publish failure, favorites/profile persistence issues) and implement full multi-user chat with unread/read states and system notifications.

**Architecture:** Keep the existing React + Express + Supabase structure and apply incremental changes. First stabilize current activity/favorite/profile flows and encoding, then add chat tables/APIs, and finally wire chat UI to backend data with verification. Keep backend as BFF, with all privileged Supabase operations server-side.

**Tech Stack:** React 19 + Vite + TypeScript, Express + TypeScript, Supabase Postgres + pg-meta SQL execution via Kong, Vitest + Supertest (backend), Vitest + RTL (frontend).

---

Execution guidance:
- Use `@superpowers/test-driven-development` for each task.
- Use `@superpowers/systematic-debugging` if any test does not fail/pass for expected reason.
- Use `@superpowers/verification-before-completion` before final completion claim.

### Task 1: Add chat database migrations and multi-user seed

**Files:**
- Create: `backend/db/migrations/003_chat_schema.sql`
- Create: `backend/db/migrations/004_chat_seed.sql`
- Modify: `backend/scripts/db-migrate.mjs`
- Test: `backend/tests/db/chat-schema.test.ts`

**Step 1: Write the failing test**

```ts
// backend/tests/db/chat-schema.test.ts
import { describe, it, expect } from "vitest";

describe("chat schema", () => {
  it("has chat tables and seed users", async () => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const res = await fetch(`${url}/pg/tables?included_schemas=public`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    const tables = (await res.json()) as Array<{ name: string; schema: string }>;
    const names = tables.filter((t) => t.schema === "public").map((t) => t.name);

    expect(names).toContain("chat_conversations");
    expect(names).toContain("chat_participants");
    expect(names).toContain("chat_messages");
    expect(names).toContain("chat_read_states");
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm --prefix backend test -- --run tests/db/chat-schema.test.ts
```

Expected: FAIL (missing chat tables).

**Step 3: Write minimal implementation**

```sql
-- backend/db/migrations/003_chat_schema.sql
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_profile_id uuid references public.profiles(id),
  content text not null,
  message_type text not null default 'text' check (message_type in ('text','system')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_read_states (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_message_id uuid references public.chat_messages(id),
  updated_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
```

**Step 4: Run migration and test**

Run:
```bash
npm --prefix backend run db:migrate
npm --prefix backend test -- --run tests/db/chat-schema.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add backend/db/migrations/003_chat_schema.sql backend/db/migrations/004_chat_seed.sql backend/scripts/db-migrate.mjs backend/tests/db/chat-schema.test.ts
git commit -m "feat(db): add chat schema and multi-user seed data"
```

### Task 2: Global encoding cleanup and static text normalization

**Files:**
- Modify: `frontend/pages/Create.tsx`
- Modify: `frontend/pages/Chat.tsx`
- Modify: `frontend/pages/ChatList.tsx`
- Modify: `frontend/pages/Profile.tsx`
- Modify: `frontend/pages/Settings.tsx`
- Test: `frontend/tests/encoding-smoke.test.ts`

**Step 1: Write the failing test**

```ts
// frontend/tests/encoding-smoke.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";

describe("encoding smoke", () => {
  it("has no common mojibake markers in key pages", () => {
    const files = [
      "frontend/pages/Create.tsx",
      "frontend/pages/Chat.tsx",
      "frontend/pages/ChatList.tsx",
      "frontend/pages/Profile.tsx",
      "frontend/pages/Settings.tsx"
    ];
    for (const f of files) {
      const txt = fs.readFileSync(f, "utf8");
      expect(txt.includes("鍛")).toBe(false);
      expect(txt.includes("�?")).toBe(false);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm --prefix frontend test -- --run tests/encoding-smoke.test.ts
```

Expected: FAIL due to garbled strings.

**Step 3: Write minimal implementation**

Replace garbled literal UI strings in scoped files with clean UTF-8 Chinese (or clear English fallback), ensuring syntactically valid JSX and consistent labels.

**Step 4: Run test and build**

Run:
```bash
npm --prefix frontend test -- --run tests/encoding-smoke.test.ts
npm --prefix frontend run build
```

Expected: PASS + build success.

**Step 5: Commit**

```bash
git add frontend/pages/Create.tsx frontend/pages/Chat.tsx frontend/pages/ChatList.tsx frontend/pages/Profile.tsx frontend/pages/Settings.tsx frontend/tests/encoding-smoke.test.ts
git commit -m "fix(frontend): normalize garbled text and encoding in key pages"
```

### Task 3: Harden activity publish flow and error path

**Files:**
- Modify: `backend/src/controllers/activityController.ts`
- Modify: `frontend/context/ActivityContext.tsx`
- Modify: `frontend/pages/Create.tsx`
- Test: `backend/tests/api/activities.create.validation.test.ts`
- Test: `frontend/context/ActivityContext.create.test.tsx`

**Step 1: Write failing tests**

```ts
// backend/tests/api/activities.create.validation.test.ts
it("returns 400 with clear code when invalid datetime", async () => {
  const res = await request(app).post("/api/v1/activities").send({ title: "x", location: "y", start_time: "bad", category: "c", max_participants: 2 });
  expect(res.status).toBe(400);
  expect(res.body.code).toBe("BAD_REQUEST");
});
```

```tsx
// frontend/context/ActivityContext.create.test.tsx
it("does not mutate list when create request fails", async () => {
  // mock initial GET success, then POST fail
});
```

**Step 2: Run tests to verify they fail**

Run:
```bash
npm --prefix backend test -- --run tests/api/activities.create.validation.test.ts
npm --prefix frontend test -- --run context/ActivityContext.create.test.tsx
```

Expected: FAIL.

**Step 3: Write minimal implementation**

- Backend: guarantee consistent `BAD_REQUEST` responses for create validation.
- Frontend: wrap `createActivity` call with error handling and user feedback; no partial UI corruption.

**Step 4: Run tests**

Run same commands; expected PASS.

**Step 5: Commit**

```bash
git add backend/src/controllers/activityController.ts frontend/context/ActivityContext.tsx frontend/pages/Create.tsx backend/tests/api/activities.create.validation.test.ts frontend/context/ActivityContext.create.test.tsx
git commit -m "fix(activity): harden publish validation and create failure handling"
```

### Task 4: Make favorites fully reliable and idempotent

**Files:**
- Modify: `backend/src/services/favoriteService.ts`
- Modify: `frontend/context/ActivityContext.tsx`
- Test: `backend/tests/api/favorites.idempotent.test.ts`
- Test: `frontend/context/ActivityContext.favorites.test.tsx`

**Step 1: Write failing tests**

```ts
// backend/tests/api/favorites.idempotent.test.ts
it("returns 409 on duplicate favorite create", async () => { /* ... */ });
```

```tsx
// frontend/context/ActivityContext.favorites.test.tsx
it("rolls back optimistic favorite toggle on server failure", async () => { /* ... */ });
```

**Step 2: Run failing tests**

Run both; expected FAIL.

**Step 3: Write minimal implementation**

- Backend: explicit duplicate detection -> `409 CONFLICT`.
- Frontend: robust rollback and user-visible error path.

**Step 4: Run tests**

Expected PASS.

**Step 5: Commit**

```bash
git add backend/src/services/favoriteService.ts frontend/context/ActivityContext.tsx backend/tests/api/favorites.idempotent.test.ts frontend/context/ActivityContext.favorites.test.tsx
git commit -m "fix(favorites): enforce idempotent behavior and rollback safety"
```

### Task 5: Ensure profile save persistence and UI rehydration

**Files:**
- Modify: `backend/src/controllers/profileController.ts`
- Modify: `frontend/context/UserContext.tsx`
- Modify: `frontend/pages/Settings.tsx`
- Test: `backend/tests/api/profile.persistence.test.ts`
- Test: `frontend/context/UserContext.update.test.tsx`

**Step 1: Write failing tests**

```ts
// backend/tests/api/profile.persistence.test.ts
it("persists profile update and returns latest state", async () => { /* ... */ });
```

```tsx
// frontend/context/UserContext.update.test.tsx
it("uses server response as source of truth after update", async () => { /* ... */ });
```

**Step 2: Run failing tests**

Expected FAIL.

**Step 3: Write minimal implementation**

- Backend: stable update response mapping.
- Frontend: `updateUser` uses response payload to set state; `Settings` waits save promise before navigation.

**Step 4: Run tests**

Expected PASS.

**Step 5: Commit**

```bash
git add backend/src/controllers/profileController.ts frontend/context/UserContext.tsx frontend/pages/Settings.tsx backend/tests/api/profile.persistence.test.ts frontend/context/UserContext.update.test.tsx
git commit -m "fix(profile): guarantee persisted updates and consistent rehydration"
```

### Task 6: Add chat repositories/services and conversation APIs

**Files:**
- Create: `backend/src/repositories/chatRepository.ts`
- Create: `backend/src/services/chatService.ts`
- Create: `backend/src/controllers/chatController.ts`
- Create: `backend/src/routes/chatRoutes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/api/chat.conversations.test.ts`

**Step 1: Write failing test**

```ts
// backend/tests/api/chat.conversations.test.ts
it("GET /api/v1/me/conversations returns list with unread_count", async () => { /* ... */ });
```

**Step 2: Run test (FAIL)**

`npm --prefix backend test -- --run tests/api/chat.conversations.test.ts`

**Step 3: Minimal implementation**

Implement:
- `GET /me/conversations`
- `POST /me/conversations/direct`
- `GET /me/notifications`

with unread count derivation from read states.

**Step 4: Run tests (PASS)**

**Step 5: Commit**

```bash
git add backend/src/repositories/chatRepository.ts backend/src/services/chatService.ts backend/src/controllers/chatController.ts backend/src/routes/chatRoutes.ts backend/src/app.ts backend/tests/api/chat.conversations.test.ts
git commit -m "feat(chat): add conversation list direct-create and notifications apis"
```

### Task 7: Add message send/read APIs

**Files:**
- Modify: `backend/src/controllers/chatController.ts`
- Modify: `backend/src/services/chatService.ts`
- Modify: `backend/src/repositories/chatRepository.ts`
- Test: `backend/tests/api/chat.messages.test.ts`

**Step 1: Write failing tests**

```ts
// backend/tests/api/chat.messages.test.ts
it("sends message and marks read state", async () => { /* ... */ });
```

**Step 2: Run tests (FAIL)**

**Step 3: Minimal implementation**

Add:
- `GET /me/conversations/:id/messages`
- `POST /me/conversations/:id/messages`
- `POST /me/conversations/:id/read`

**Step 4: Run tests (PASS)**

**Step 5: Commit**

```bash
git add backend/src/controllers/chatController.ts backend/src/services/chatService.ts backend/src/repositories/chatRepository.ts backend/tests/api/chat.messages.test.ts
git commit -m "feat(chat): add message list send and read apis"
```

### Task 8: Wire ChatList page to backend conversations

**Files:**
- Modify: `frontend/pages/ChatList.tsx`
- Create: `frontend/context/ChatContext.tsx`
- Test: `frontend/context/ChatContext.conversations.test.tsx`

**Step 1: Write failing test**

```tsx
it("loads conversation list and unread counts", async () => { /* ... */ });
```

**Step 2: Run test (FAIL)**

**Step 3: Minimal implementation**

- Introduce `ChatContext` with fetch to `/api/v1/me/conversations`.
- Replace `mockChats` rendering with API data.

**Step 4: Run test + build (PASS)**

**Step 5: Commit**

```bash
git add frontend/pages/ChatList.tsx frontend/context/ChatContext.tsx frontend/context/ChatContext.conversations.test.tsx
git commit -m "feat(frontend-chat): connect chat list to conversation api"
```

### Task 9: Wire Chat page to backend messages/send/read

**Files:**
- Modify: `frontend/pages/Chat.tsx`
- Modify: `frontend/context/ChatContext.tsx`
- Test: `frontend/context/ChatContext.messages.test.tsx`

**Step 1: Write failing test**

```tsx
it("loads messages, sends message, and marks read", async () => { /* ... */ });
```

**Step 2: Run test (FAIL)**

**Step 3: Minimal implementation**

- On open: fetch messages + call read endpoint.
- On send: call send endpoint and append returned message.
- Keep pagination cursor simple (`limit + cursor`) for now.

**Step 4: Run test + build (PASS)**

**Step 5: Commit**

```bash
git add frontend/pages/Chat.tsx frontend/context/ChatContext.tsx frontend/context/ChatContext.messages.test.tsx
git commit -m "feat(frontend-chat): connect message thread send and read flows"
```

### Task 10: Full verification and functional audit report

**Files:**
- Create: `docs/testing/2026-03-04-stability-chat-verification-report.md`
- Modify: `docs/testing/mvp-smoke-checklist.md`

**Step 1: Add verification checklist tests (if missing)**

Add any missing backend/frontend test cases identified during run.

**Step 2: Run full verification**

Run:
```bash
npm --prefix backend run db:migrate
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

Expected:
- All commands exit `0`
- No failing tests
- Build succeeds

**Step 3: Manual audit execution**

Execute and record:
1. Create page no garbled text + publish success.
2. Favorite add/remove + refresh persistence.
3. Profile save + refresh persistence.
4. Multi-user message + unread/read transitions.
5. System notifications visible and persisted.
6. Restart frontend/backend and confirm DB-backed persistence.

**Step 4: Write report**

Document pass/fail per feature with timestamp and observed evidence.

**Step 5: Commit**

```bash
git add docs/testing/2026-03-04-stability-chat-verification-report.md docs/testing/mvp-smoke-checklist.md
git commit -m "test: add full stability-chat verification report"
```

### Completion Gate

Before claiming done:
- `@superpowers/verification-before-completion` required
- Run full command set again if any code changed after initial verification
- If any manual item fails, do not close; add follow-up tasks and keep branch open
