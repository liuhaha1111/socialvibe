## Context

The current system assumes a single fixed user (`TEST_PROFILE_ID`) in backend services and frontend contexts. This allows MVP data flows but blocks real multi-user behavior and secure access control. The backend already uses Supabase as the data/auth platform, and the frontend already has centralized API and user state layers (`frontend/lib/api.ts`, `frontend/context/UserContext.tsx`).

Constraints:
- Keep existing `/api/v1` response envelope shape (`{ code, message, data }`).
- Minimize disruption to non-auth feature behavior (activities, favorites, profile).
- Use Supabase Auth as the identity provider instead of building custom credential storage.

Stakeholders:
- End users need signup/login/logout.
- Frontend needs reliable auth state and guarded navigation.
- Backend needs deterministic user identity per request for user-scoped APIs.

## Goals / Non-Goals

**Goals:**
- Enable email/password sign-up and sign-in in frontend.
- Propagate access token on API requests and validate it server-side.
- Replace all `TEST_PROFILE_ID`-based user resolution with authenticated identity.
- Auto-provision profile data when a newly authenticated user has no profile row.
- Preserve current activity/favorite/profile feature behavior under authenticated identity.

**Non-Goals:**
- OAuth providers (Google/Apple/etc.).
- MFA, passwordless login, or enterprise SSO.
- Full RBAC/permission matrix beyond per-user scoping.
- Refactoring the entire routing architecture beyond auth guard needs.

## Decisions

1. Use Supabase Auth email/password as the only auth mechanism in this change.
- Rationale: Supabase is already in stack and avoids storing passwords in app code.
- Alternative considered: custom JWT/password tables in backend; rejected due to security and maintenance cost.

2. Validate bearer tokens in backend middleware using Supabase `auth.getUser(token)` and attach user identity to request context.
- Rationale: centralized verification keeps controllers/services simple and consistent.
- Alternative considered: per-controller token parsing; rejected as duplicated logic and higher drift risk.

3. Protect all user-scoped endpoints (`/api/v1/me/*`, activity create, favorite mutate/list) and return standardized auth errors.
- Rationale: these endpoints modify/read user-specific state and must not fall back to shared identity.
- Alternative considered: gradual mixed mode (optional auth); rejected because it keeps unsafe ambiguity.

4. Introduce frontend auth state provider responsible for session bootstrap, token refresh hookup, and logout reset.
- Rationale: replaces ad-hoc token handling and gives a single source of truth.
- Alternative considered: store token only in API util; rejected because UI needs auth status and session lifecycle events.

5. Keep backend profile table separate from `auth.users`, linked by user id (UUID), and bootstrap profile row on first authenticated access.
- Rationale: preserves current profile domain model while mapping to auth identity.
- Alternative considered: mandatory pre-provisioning via DB trigger; deferred to reduce migration coupling in first iteration.

6. Keep response envelope and introduce explicit auth codes (`UNAUTHORIZED`, `FORBIDDEN` when needed) for predictable frontend handling.
- Rationale: avoids changing frontend error plumbing while making auth failures actionable.
- Alternative considered: raw Supabase error passthrough; rejected due to unstable client contracts.

## Risks / Trade-offs

- [Risk] Token verification on each request increases latency. -> Mitigation: apply only on protected routes and measure in backend logs.
- [Risk] Incomplete replacement of `TEST_PROFILE_ID` could leak shared-user behavior. -> Mitigation: remove env dependency from user-scoped services and add targeted tests.
- [Risk] First-login profile bootstrap may produce partial data defaults. -> Mitigation: define deterministic defaults and require editable profile fields.
- [Risk] Frontend session desync after token expiry can create redirect loops. -> Mitigation: centralize auth event handling and clear invalid session state atomically.
- [Risk] Breaking API auth requirement impacts existing clients/tests. -> Mitigation: update tests/fixtures and document required `Authorization` header.

## Migration Plan

1. Add auth middleware and request context typing in backend.
2. Refactor user-scoped services/controllers to consume authenticated user id instead of `TEST_PROFILE_ID`.
3. Add profile bootstrap path for first authenticated access.
4. Add frontend auth pages/components and auth provider; inject bearer token into API client.
5. Guard routes requiring authenticated session and define unauthenticated entry flow.
6. Update automated tests for authenticated vs unauthenticated behavior.
7. Rollout strategy: deploy backend support first, then frontend auth UI; monitor auth error rates.

Rollback:
- Revert route protection and user identity changes in one release if critical failures occur.
- Temporarily restore fixed-profile behavior behind config flag only for emergency local testing (not production).

## Open Questions

- Should activity list (`GET /api/v1/activities`) be public-read or auth-required in v1 of this change?
- What default profile values should be used on bootstrap when user metadata is missing?
- Should token refresh be fully delegated to Supabase client defaults or explicitly managed in app lifecycle hooks?
- Do we need rate limiting or captcha for signup/signin endpoints in this phase?
