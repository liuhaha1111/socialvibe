# SocialVibe Real Interaction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复收藏/乱码/资料保存问题，并实现真实好友关系、实时私聊、活动自动群聊，移除静态社交数据。

**Architecture:** 继续使用 React + Express(BFF) + Supabase。后端新增 friend/chat 领域 API 与数据表，前端替换静态聊天与活动卡片为 API + Realtime 数据流。所有用户相关行为统一基于认证身份和持久化数据。

**Tech Stack:** React 19, React Router, Supabase JS + Realtime, Express, Zod, Vitest, Postgres(Supabase)

---

### Task 1: 修复收藏显示链路（移除静态 activity fallback）

**Files:**
- Modify: `frontend/pages/Detail.tsx`
- Modify: `frontend/pages/Home.tsx`
- Modify: `frontend/pages/Saved.tsx`
- Test: `frontend/context/ActivityContext.test.tsx`

**Step 1: Write the failing test**

在 `frontend/context/ActivityContext.test.tsx` 新增场景：只允许真实 UUID 活动进入收藏列表，静态 fallback ID 不应参与持久收藏流程。

```tsx
it("does not rely on static fallback activity id for favorites", async () => {
  // render provider + simulate favorite toggle on a non-uuid id
  // expect persistent favorites list to remain API-driven only
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- context/ActivityContext.test.tsx`  
Expected: FAIL（当前存在静态 fallback 路径）

**Step 3: Write minimal implementation**

- 在 `frontend/pages/Detail.tsx` 删除 `mock-trending-1` fallback。
- 无有效 `location.state.activity.id` 时跳回首页或展示“活动不存在”。
- 在 `frontend/pages/Home.tsx` 去掉静态 trending 点击到无真实 ID 的详情行为（改成真实活动）。

**Step 4: Run test to verify it passes**

Run: `npm --prefix frontend test -- context/ActivityContext.test.tsx`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/pages/Detail.tsx frontend/pages/Home.tsx frontend/pages/Saved.tsx frontend/context/ActivityContext.test.tsx
git commit -m "fix: remove static activity fallback from favorites/detail flow"
```

### Task 2: 修复个人资料保存失败（空 email 处理）

**Files:**
- Modify: `frontend/context/UserContext.tsx`
- Modify: `backend/src/controllers/profileController.ts`
- Test: `frontend/context/UserContext.test.tsx`
- Test: `backend/tests/api/profile.test.ts`

**Step 1: Write the failing tests**

前端：空 email 不应传给后端。  
后端：空 email payload 不应触发非法邮箱报错（由前端清洗或后端 null 化）。

```tsx
it("omits empty email from update payload", async () => {
  // updateUser({ email: "" }) -> payload should not include email
});
```

```ts
it("accepts profile update without email field", async () => {
  // PUT /api/v1/me/profile with no email -> 200
});
```

**Step 2: Run tests to verify they fail**

Run:  
`npm --prefix frontend test -- context/UserContext.test.tsx`  
`npm --prefix backend test -- tests/api/profile.test.ts`

Expected: FAIL

**Step 3: Write minimal implementation**

- `frontend/context/UserContext.tsx`：对 `email` 做 `trim`，空字符串则不发送字段。
- 必要时后端 controller 对 `email: ""` 转为 `undefined` 或 `null`（保持 Zod 校验一致）。

**Step 4: Run tests to verify they pass**

Run same commands  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/context/UserContext.tsx backend/src/controllers/profileController.ts frontend/context/UserContext.test.tsx backend/tests/api/profile.test.ts
git commit -m "fix: make profile update robust for empty email values"
```

### Task 3: 修复页面乱码并统一为简体中文

**Files:**
- Modify: `frontend/pages/Create.tsx`
- Modify: `frontend/pages/Home.tsx`
- Modify: `frontend/pages/Detail.tsx`
- Modify: `frontend/pages/Profile.tsx`
- Modify: `frontend/pages/Saved.tsx`
- Modify: `frontend/pages/ChatList.tsx`
- Modify: `frontend/pages/Chat.tsx`
- Test: `frontend/pages/Create.text.test.tsx`

**Step 1: Write the failing test**

新增文案渲染测试，验证关键中文标题存在。

```tsx
it("renders create page chinese headings without mojibake", () => {
  // expect screen.getByText("发布新活动")
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- pages/Create.text.test.tsx`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 替换乱码文案为 UTF-8 简体中文。
- 不改业务逻辑，只修文字和显性静态展示文案。

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/pages/Create.tsx frontend/pages/Home.tsx frontend/pages/Detail.tsx frontend/pages/Profile.tsx frontend/pages/Saved.tsx frontend/pages/ChatList.tsx frontend/pages/Chat.tsx frontend/pages/Create.text.test.tsx
git commit -m "fix: replace mojibake strings with simplified chinese copy"
```

### Task 4: 新增社交与聊天数据库结构（含活动成员）

**Files:**
- Create: `backend/db/migrations/004_social_chat_schema.sql`
- Modify: `backend/scripts/db-migrate.mjs`
- Test: `backend/tests/db/social-schema.test.ts`

**Step 1: Write the failing test**

```ts
it("has friend/chat/activity-member tables", async () => {
  // assert friend_requests friendships conversations conversation_members messages activity_members
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- tests/db/social-schema.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 新增数据表和必要索引/唯一约束：
  - `friend_requests`
  - `friendships`
  - `conversations`
  - `conversation_members`
  - `messages`
  - `activity_members`
- `db-migrate.mjs` 加入 `004_social_chat_schema.sql`。

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add backend/db/migrations/004_social_chat_schema.sql backend/scripts/db-migrate.mjs backend/tests/db/social-schema.test.ts
git commit -m "feat: add social graph and chat schema migrations"
```

### Task 5: 好友申请与好友关系 API

**Files:**
- Create: `backend/src/repositories/friendRepository.ts`
- Create: `backend/src/services/friendService.ts`
- Create: `backend/src/controllers/friendController.ts`
- Create: `backend/src/routes/friendRoutes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/api/friends.test.ts`

**Step 1: Write the failing test**

覆盖发起申请、重复申请冲突、同意后成为好友、拉取好友列表。

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- tests/api/friends.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 新增 `/api/v1/friends/*` 路由（鉴权保护）。
- 服务层实现：
  - create request
  - accept/reject
  - list friends

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/repositories/friendRepository.ts backend/src/services/friendService.ts backend/src/controllers/friendController.ts backend/src/routes/friendRoutes.ts backend/src/app.ts backend/tests/api/friends.test.ts
git commit -m "feat: add friend request and friendship apis"
```

### Task 6: 会话与消息 API（私聊 + 活动群聊）

**Files:**
- Create: `backend/src/repositories/chatRepository.ts`
- Create: `backend/src/services/chatService.ts`
- Create: `backend/src/controllers/chatController.ts`
- Create: `backend/src/routes/chatRoutes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/api/chat.test.ts`

**Step 1: Write the failing test**

覆盖：
- 非好友禁止创建私聊（403）
- 好友可创建/获取私聊
- 会话成员可发/读消息
- 非成员访问消息返回 403

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- tests/api/chat.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 新增 `/api/v1/chat/*`。
- 在 service 层统一校验 friendship/member 权限。
- 消息写入 `messages`，查询按 `created_at` 升序。

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/repositories/chatRepository.ts backend/src/services/chatService.ts backend/src/controllers/chatController.ts backend/src/routes/chatRoutes.ts backend/src/app.ts backend/tests/api/chat.test.ts
git commit -m "feat: add direct and group conversation messaging apis"
```

### Task 7: 活动与群聊联动（活动自动群）

**Files:**
- Modify: `backend/src/services/activityService.ts`
- Modify: `backend/src/controllers/activityController.ts`
- Modify: `backend/src/repositories/activityRepository.ts`
- Modify: `backend/src/services/chatService.ts`
- Test: `backend/tests/api/activities.group-chat.test.ts`

**Step 1: Write the failing test**

覆盖：
- 创建活动后自动创建活动群会话并把主办方加入成员。
- 用户加入活动后被加入对应活动群成员。

**Step 2: Run test to verify it fails**

Run: `npm --prefix backend test -- tests/api/activities.group-chat.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 新增活动参与接口（例如 `POST /api/v1/activities/:id/join`）。
- 创建活动和报名时同步 conversation/member。

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/services/activityService.ts backend/src/controllers/activityController.ts backend/src/repositories/activityRepository.ts backend/src/services/chatService.ts backend/tests/api/activities.group-chat.test.ts
git commit -m "feat: auto-wire activity groups with chat memberships"
```

### Task 8: 前端好友管理页面与 API 接入

**Files:**
- Create: `frontend/lib/friendsApi.ts`
- Create: `frontend/pages/Friends.tsx`
- Modify: `frontend/App.tsx`
- Modify: `frontend/pages/Profile.tsx`
- Test: `frontend/pages/Friends.test.tsx`

**Step 1: Write the failing test**

覆盖申请列表加载、同意按钮行为、好友列表展示。

**Step 2: Run test to verify it fails**

Run: `npm --prefix frontend test -- pages/Friends.test.tsx`  
Expected: FAIL

**Step 3: Write minimal implementation**

- 新增好友页面与数据加载。
- Profile 增加“好友管理”入口。
- 路由接入 `/friends`。

**Step 4: Run test to verify it passes**

Run same command  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/lib/friendsApi.ts frontend/pages/Friends.tsx frontend/App.tsx frontend/pages/Profile.tsx frontend/pages/Friends.test.tsx
git commit -m "feat: add friend management page and api integration"
```

### Task 9: 重写聊天列表/聊天页为真实数据 + Realtime

**Files:**
- Create: `frontend/lib/chatApi.ts`
- Modify: `frontend/pages/ChatList.tsx`
- Modify: `frontend/pages/Chat.tsx`
- Modify: `frontend/pages/Detail.tsx`
- Test: `frontend/pages/ChatList.test.tsx`
- Test: `frontend/pages/Chat.test.tsx`

**Step 1: Write the failing tests**

覆盖：
- 会话列表来自 API（无静态 mock）。
- 新消息到达时页面实时追加。

**Step 2: Run tests to verify they fail**

Run:  
`npm --prefix frontend test -- pages/ChatList.test.tsx`  
`npm --prefix frontend test -- pages/Chat.test.tsx`

Expected: FAIL

**Step 3: Write minimal implementation**

- `ChatList` 调用 `/api/v1/chat/conversations`。
- `Chat` 调用消息读写 API + Supabase Realtime 订阅 `messages`。
- `Detail` 的“私信”入口改为真实创建/进入会话流程。

**Step 4: Run tests to verify they pass**

Run same commands  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/lib/chatApi.ts frontend/pages/ChatList.tsx frontend/pages/Chat.tsx frontend/pages/Detail.tsx frontend/pages/ChatList.test.tsx frontend/pages/Chat.test.tsx
git commit -m "feat: replace static chat with realtime api-driven conversations"
```

### Task 10: 全量回归与文档更新

**Files:**
- Modify: `frontend/README.md`
- Modify: `docs/testing/mvp-smoke-checklist.md`
- Modify: `backend/.env.example`
- Modify: `frontend/.env.example`

**Step 1: Add/refresh regression commands**

记录并执行：
- `npm --prefix backend run build`
- `npm --prefix frontend run build`
- `npm --prefix frontend test`
- `npm --prefix backend test`（具备本地 Supabase 环境时）

**Step 2: Run commands and capture outcomes**

Expected:
- 前端 build/test 全绿
- 后端 build 通过
- 后端 test 在本地 Supabase 环境下通过

**Step 3: Update docs**

- 文档补充好友、聊天、实时、活动群流程和环境变量说明。

**Step 4: Final verification**

手工冒烟：
- 收藏可见
- 发布页中文正常
- 资料保存可成功
- 好友申请->同意->私聊
- 活动群聊可见并实时收发消息

**Step 5: Commit**

```bash
git add frontend/README.md docs/testing/mvp-smoke-checklist.md backend/.env.example frontend/.env.example
git commit -m "docs: update real-interaction setup and verification guide"
```
