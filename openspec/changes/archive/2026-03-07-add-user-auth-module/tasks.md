## 1. Backend Auth Foundation

- [x] 1.1 Add backend auth middleware that extracts bearer tokens and verifies user identity with Supabase Auth.
- [x] 1.2 Extend backend request typing/context so controllers and services can access authenticated user id.
- [x] 1.3 Add standardized auth error mapping (`UNAUTHORIZED`, `FORBIDDEN`) in backend error handling.

## 2. Replace Fixed Profile Identity

- [x] 2.1 Refactor profile, favorite, and activity services to remove `TEST_PROFILE_ID` usage for request-scoped operations.
- [x] 2.2 Update protected routes/controllers (`/api/v1/me/*`, favorite mutations, activity create) to require authenticated middleware.
- [x] 2.3 Keep or explicitly document access policy for public vs protected activity read endpoints.

## 3. Profile Bootstrap and Data Mapping

- [x] 3.1 Implement first-login profile bootstrap when authenticated user has no profile row.
- [x] 3.2 Define and apply deterministic default profile fields for bootstrap behavior.
- [x] 3.3 Add/adjust repository queries and migrations needed to map profile records to auth user ids safely.

## 4. Frontend Auth and Session Lifecycle

- [x] 4.1 Add sign-up/sign-in/sign-out flows using Supabase client auth methods.
- [x] 4.2 Introduce frontend auth provider/state to bootstrap session and expose auth status.
- [x] 4.3 Update API client to attach bearer token for protected API requests.

## 5. Routing, UX Guardrails, and Regression Coverage

- [x] 5.1 Add route protection so unauthenticated users are redirected to auth entry pages.
- [x] 5.2 Ensure logout clears auth/session-dependent UI state and prevents protected API calls.
- [x] 5.3 Add backend tests for missing/invalid/valid token cases on protected endpoints.
- [x] 5.4 Add frontend tests for auth gating and session-aware API behavior.
- [x] 5.5 Update docs/env samples to replace fixed test-user assumptions with auth configuration requirements.
