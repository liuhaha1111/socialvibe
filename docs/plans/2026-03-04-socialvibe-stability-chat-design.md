# SocialVibe Stability + Chat Full Design

- Date: 2026-03-04
- Scope: Stability fixes + full chat implementation
- User-confirmed goals:
  - Fix garbled text globally
  - Fix activity publishing reliability
  - Fix favorites reliability
  - Fix profile save persistence
  - Implement full chat (multi-user, unread/read state, system notifications)
  - Verify all features and persistence with automated + manual checks

## 1. Architecture and Change Scope

This round keeps the existing MVP architecture and extends it incrementally:

- `backend/` stays as Express BFF over Supabase.
- `frontend/` keeps current routes/pages and replaces remaining mock chat behavior with API-backed data.
- `supabase` remains the single source of truth.

Backend additions:
- `routes/chatRoutes.ts`
- `controllers/chatController.ts`
- `services/chatService.ts`
- `repositories/chatRepository.ts`

Execution phases:
1. Phase A: global encoding/text cleanup + publish flow stability
2. Phase B: favorites/profile persistence reliability fixes
3. Phase C: full chat domain (multi-test users, conversations, messages, unread/read, system notifications)
4. Phase D: full verification (automated + manual + persistence checks)

## 2. Database Design

Existing tables remain:
- `profiles`
- `activities`
- `favorites`

New chat tables:

### 2.1 `chat_conversations`
- `id uuid primary key`
- `type text not null` (`direct` or `system`)
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### 2.2 `chat_participants`
- `conversation_id uuid not null references chat_conversations(id)`
- `profile_id uuid not null references profiles(id)`
- `joined_at timestamptz default now()`
- Primary key: `(conversation_id, profile_id)`

### 2.3 `chat_messages`
- `id uuid primary key`
- `conversation_id uuid not null references chat_conversations(id)`
- `sender_profile_id uuid references profiles(id)` (nullable for system messages if needed)
- `content text not null`
- `message_type text not null default 'text'` (`text` or `system`)
- `created_at timestamptz default now()`

### 2.4 `chat_read_states`
- `conversation_id uuid not null references chat_conversations(id)`
- `profile_id uuid not null references profiles(id)`
- `last_read_message_id uuid references chat_messages(id)`
- `updated_at timestamptz default now()`
- Primary key: `(conversation_id, profile_id)`

Indexes:
- `chat_messages(conversation_id, created_at desc)`
- `chat_participants(profile_id)`
- `chat_read_states(profile_id)`

Seed strategy:
- Create at least 3 fixed test profiles (A/B/C).
- Seed direct conversations and messages.
- Seed system conversation/messages for notification display.

## 3. API Design

Base prefix: `/api/v1`

Stability-related existing APIs (to harden):
- `POST /activities`
- `GET /me/favorites`
- `POST /me/favorites/:activityId`
- `DELETE /me/favorites/:activityId`
- `GET /me/profile`
- `PUT /me/profile`

New chat APIs:

1. `GET /me/conversations`
- Return conversation list with peer info, last message, unread count, type, updated time.

2. `GET /me/conversations/:conversationId/messages?cursor=<...>&limit=<...>`
- Return paginated message history.

3. `POST /me/conversations/:conversationId/messages`
- Send a message.
- Input: `content`, `message_type`.

4. `POST /me/conversations/:conversationId/read`
- Mark conversation read up to latest message.

5. `POST /me/conversations/direct`
- Input: `peer_profile_id`.
- Idempotent: reuse existing direct conversation if present.

6. `GET /me/notifications`
- Return system notification stream (backed by system conversations/messages).

Frontend wiring:
- `ChatList` -> `/me/conversations`
- `Chat` -> messages load + send + mark read
- Favorites keep optimistic UI with rollback on API failure
- Settings uses server response as source of truth after save

## 4. Error Handling, Testing, and Acceptance

Unified response envelope:
- `{ code, message, data }`

Status mapping:
- `400` bad request / validation
- `404` resource not found
- `409` conflict (duplicate favorite / duplicate direct-conversation create)
- `500` internal error

Consistency rules:
- Favorite toggles must rollback on API failure.
- Profile save must rehydrate from server response.
- Unread count is derived from read state, not guessed on client.

Automated tests required:

Backend:
- Publish success/failure
- Favorite create/delete/list idempotence and conflict handling
- Profile read/update persistence
- Conversation list correctness
- Message send + read-state update
- Unread count correctness

Frontend:
- `ActivityContext` load/create/favorite rollback
- `UserContext` load/save path
- `ChatList` data binding
- `Chat` send + mark-read path

Manual acceptance required:
1. Create page has no garbled text and can publish successfully.
2. Favorite add/remove reflects in Saved and persists after refresh.
3. Profile updates persist after refresh.
4. User A -> User B message flow updates unread counts correctly.
5. System notifications are visible and persisted.
6. Data survives service restarts.

## Out of Scope

- Production auth onboarding
- Media/file message uploads
- Group chats beyond direct + system flows

## Next Step

Use `writing-plans` to produce a detailed implementation plan.
