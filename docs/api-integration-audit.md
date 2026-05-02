# API Integration Audit

Date: 2026-05-02

## What I Found

The backend already follows a scalable Express + TypeScript module architecture:

- `apps/api/src/app/routers/index.ts` centralizes module routes under `/api`.
- Each main domain lives under `apps/api/src/app/modules/*`.
- Controllers are mostly thin and wrapped with `CatchAsync`.
- Services own Prisma reads/writes and workspace membership checks.
- Validation uses Zod through `ValidationRequest`.
- Responses are normalized through `SuccessResponse`.
- Auth uses JWT access tokens plus refresh-token cookies.
- Workspace authorization is handled by `requireWorkspaceMember`, `requireWorkspaceMemberFromParams`, and `requireWorkspaceAdmin`.
- Socket.io is initialized once in `server.ts`, attached to Express with `app.set('io', io)`, and workspace events use `workspace:{id}` rooms.

The frontend is not integrated yet:

- `apps/web/.env` has empty `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`.
- `apps/web/src/store/useAppStore.js` contains mock users, tasks, goals, announcements, workspaces, and notifications.
- No frontend source currently calls `fetch`, `axios`, Socket.io, or a typed API client.
- Dashboard pages consume mock Zustand state directly.

## Backend Architecture Strengths

### Route and module consistency

Most modules use the expected pattern:

- `*.route.ts`
- `*.controller.ts`
- `*.service.ts`
- `*.validation.ts` where request validation exists

Good examples:

- `auth`
- `users`
- `workspaces`
- `goals`
- `tasks`
- `announcements`
- `notifications`
- `audit`

### Thin controllers

Controllers generally:

- resolve request context
- call one service function
- emit socket events when needed
- return `SuccessResponse`

This is a good production pattern and should be preserved.

### Service-owned database logic

Prisma access generally lives in services. This makes future frontend integration safer because request handlers can stay small while service methods remain reusable.

### Workspace isolation

Workspace membership checks are present in middleware and service-level assertions. This is important for multi-tenant safety.

### Real-time foundation

Socket authentication, `join-workspace`, workspace rooms, and `emitWorkspace` already exist. This is enough foundation for live tasks, announcements, notifications, and presence without introducing a new socket architecture.

## Current Risks

### Frontend is mock-first

The frontend currently presents realistic UI but does not use backend data. The main integration risk is state-shape mismatch:

- frontend task columns: `todo`, `inProgress`, `review`, `done`
- backend task statuses: `TODO`, `IN_PROGRESS`, `DONE`
- frontend priority values: `low`, `medium`, `high`
- backend priority values: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

Mapping should live in API/store adapters, not inside UI components.

### Nested workspace routes duplicate service behavior

`apps/api/src/app/modules/workspaces/workspace.nested.ts` is 446 lines and contains many inline handlers, transformations, and direct Prisma calls. It is useful for frontend-friendly routes, but it partially bypasses the cleaner module route/controller/service pattern.

Keep it for compatibility, but gradually move logic back into feature services or small nested controllers.

### Some validation is defined but not applied

Example: `taskValidation.listQuery` exists but `task.route.ts` does not apply it to `GET /tasks`.

Add validation incrementally when touching endpoints.

### Socket events are uneven

Top-level task and announcement controllers emit events, but nested workspace endpoints often do not. If the frontend uses nested routes, real-time updates may not fire consistently.

### Auth is good enough, but incomplete flows are visible

Do not rewrite auth. Current gaps should be documented and completed later:

- password reset persistence is not implemented
- email verification returns `{ verified: true }`
- frontend login/register still use mock state

## Feature and Page Wise API Integration Map

### Home page

Frontend:

- `apps/web/src/app/page.js`
- `apps/web/src/components/pages/home/*`

Backend need:

- No required API integration.

Recommendation:

- Keep static unless marketing/contact/pricing becomes dynamic.

### Login page

Frontend:

- `apps/web/src/app/(auth)/login/page.jsx`
- `apps/web/src/components/pages/login/login.jsx`

Backend:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Auth:

- login returns `data.user` and `data.accessToken`
- refresh token is set as an HTTP-only cookie
- access token must be stored client-side or in memory and sent as `Authorization: Bearer <token>`

Integration tasks:

- Create `src/services/apiClient.js`.
- Create `src/services/authApi.js`.
- Replace mock `login` in Zustand with real login.
- Persist only safe auth metadata; avoid persisting refresh token.
- Add refresh handling for 401 responses.

### Register page

Frontend:

- `apps/web/src/app/(auth)/register/page.js`
- `apps/web/src/components/pages/register/register.jsx`

Backend:

- `POST /api/auth/register`

Payload:

- `name`
- `email`
- `password`
- optional `workspaceName`
- optional `description`

Integration tasks:

- Connect form to `authApi.register`.
- If workspace name is collected, pass it to backend.
- After success, set user/access token and route to dashboard.

### Dashboard overview

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/page.js`
- `apps/web/src/components/pages/dashboard/dashboard.jsx`

Backend:

- `GET /api/analytics/dashboard` with `x-workspace-id`
- or nested `GET /api/workspaces/:workspaceId/analytics/overview`
- `GET /api/workspaces/:id/stats`

Integration tasks:

- Prefer workspace-scoped analytics through one consistent route family.
- Fetch active workspace first.
- Load overview cards, recent activity, task summaries, and goal summaries from APIs.

### Workspace page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/workspace/page.js`
- `apps/web/src/components/pages/dashboard/workspace/workspace.jsx`

Backend:

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/:id`
- `PATCH /api/workspaces/:id`
- `DELETE /api/workspaces/:id`
- `GET /api/workspaces/:id/members`
- `POST /api/workspaces/:id/invite`
- `PATCH /api/workspaces/:id/members/:userId`
- `DELETE /api/workspaces/:id/members/:userId`

Integration tasks:

- Create `workspaceApi.js`.
- Create workspace store slice.
- Use active workspace id across all dashboard API calls.
- Send `x-workspace-id` for top-level workspace-scoped modules when not using nested routes.

### Tasks page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/tasks/page.js`

Backend:

- `GET /api/tasks?workspaceId=...`
- `POST /api/tasks`
- `GET /api/tasks/:id?workspaceId=...`
- `PATCH /api/tasks/:id?workspaceId=...`
- `DELETE /api/tasks/:id?workspaceId=...`
- or nested:
- `GET /api/workspaces/:workspaceId/tasks/board`
- `GET /api/workspaces/:workspaceId/tasks`
- `POST /api/workspaces/:workspaceId/tasks`
- `PATCH /api/workspaces/:workspaceId/tasks/:id/move`
- `POST /api/workspaces/:workspaceId/tasks/bulk-move`

Integration tasks:

- Create `taskApi.js`.
- Normalize backend statuses to UI columns.
- Normalize UI columns back to backend statuses.
- Replace mock `moveTask` with optimistic API updates.
- Subscribe to `task-updated` socket events.

Recommended status map:

- `TODO` -> `todo`
- `IN_PROGRESS` -> `inProgress`
- `DONE` -> `done`
- Avoid frontend `review` until backend adds a `REVIEW` status, or map `review` to `IN_PROGRESS` intentionally.

### Goals page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/goals/page.js`

Backend:

- `GET /api/goals` with `x-workspace-id`
- `POST /api/goals` with `x-workspace-id`
- `GET /api/goals/:id`
- `PATCH /api/goals/:id`
- `DELETE /api/goals/:id`
- `GET /api/goals/:id/activity`
- `POST /api/goals/:id/updates`
- `POST /api/goals/:id/milestones`
- nested workspace goal routes also exist

Integration tasks:

- Create `goalApi.js`.
- Convert progress from milestone data or use nested `/progress` endpoint.
- Split large page into list, card, form, detail/activity components.

### Announcements page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/announcements/page.js`

Backend:

- `GET /api/announcements` with `x-workspace-id`
- `POST /api/announcements`
- `PATCH /api/announcements/:id`
- `DELETE /api/announcements/:id`
- `POST /api/announcements/:id/react`
- `POST /api/announcements/:id/comment`
- `POST /api/announcements/:id/pin`
- nested workspace announcement routes also exist

Integration tasks:

- Create `announcementApi.js`.
- Normalize reaction arrays to UI reaction counts.
- Replace local-only compose/react state with API calls.
- Subscribe to `new-announcement`, `reaction-added`, `comment-added`, and `announcement-pinned`.

### Analytics page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/analytics/page.js`

Backend:

- `GET /api/analytics/dashboard` with `x-workspace-id`
- nested:
- `GET /api/workspaces/:workspaceId/analytics/overview`
- `GET /api/workspaces/:workspaceId/analytics/tasks`
- `GET /api/workspaces/:workspaceId/analytics/activity`
- `GET /api/workspaces/:workspaceId/analytics/goals`
- `GET /api/workspaces/:workspaceId/analytics/velocity`
- `GET /api/workspaces/:workspaceId/analytics/members`
- `GET /api/workspaces/:workspaceId/analytics/heatmap`

Integration tasks:

- Create `analyticsApi.js`.
- Replace `ANALYTICS_DATA` constants with API-backed selectors.
- Keep chart-specific shaping in frontend adapters, not API components.

### Profile page

Frontend:

- `apps/web/src/app/(dashboard)/dashboard/profile/page.js`

Backend:

- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`
- `PATCH /api/users/me/preferences`
- `POST /api/users/avatar`
- `DELETE /api/users/me`
- `GET /api/users/:id/activity`
- `GET /api/users/:id/contributions`
- notification preferences:
- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`

Integration tasks:

- Create `userApi.js`.
- Create `notificationApi.js`.
- Split profile page into tab components before API integration.
- Connect avatar upload with `FormData`.

### Notifications

Frontend:

- currently represented in `useAppStore.js` and common header/sidebar UI

Backend:

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/:id`
- `DELETE /api/notifications`
- preferences endpoints

Integration tasks:

- Create `notificationApi.js`.
- Add notification store slice.
- Fetch unread count in dashboard layout/header.
- Add socket event for new notifications if backend emits it.

### Export and audit logs

Backend:

- `GET /api/export/csv` with `x-workspace-id`
- `GET /api/audit-logs` with `x-workspace-id`

Integration tasks:

- Add frontend export action from analytics/workspace pages.
- Add audit/activity feed if product requires it.

## Component Line Count Audit

Target: each frontend component/page should stay around 200-250 lines maximum.

Files above target:

- `apps/web/src/app/(dashboard)/dashboard/profile/page.js` - 1064 lines
- `apps/web/src/app/(dashboard)/dashboard/analytics/page.js` - 1033 lines
- `apps/web/src/components/pages/dashboard/workspace/workspace.jsx` - 426 lines
- `apps/web/src/store/useAppStore.js` - 395 lines
- `apps/web/src/app/(dashboard)/dashboard/tasks/page.js` - 351 lines
- `apps/web/src/app/(dashboard)/dashboard/announcements/page.js` - 342 lines
- `apps/web/src/components/pages/dashboard/dashboard.jsx` - 333 lines
- `apps/web/src/components/pages/home/HowItWorksSection.js` - 320 lines
- `apps/web/src/components/pages/register/register.jsx` - 279 lines
- `apps/web/src/app/(auth)/register/page.js` - 279 lines
- `apps/web/src/components/pages/home/HeroSection.js` - 277 lines
- `apps/web/src/components/common/sidebar.jsx` - 257 lines
- `apps/web/src/app/(dashboard)/dashboard/goals/page.js` - 251 lines

Backend files above target:

- `apps/api/src/app/docs/swagger.ts` - 1216 lines
- `apps/api/src/app/modules/workspaces/workspace.nested.ts` - 446 lines
- `apps/api/src/app/modules/goals/goal.service.ts` - 275 lines

Backend files near the limit:

- `apps/api/src/app/modules/announcements/announcement.service.ts` - 212 lines
- `apps/api/src/app/modules/tasks/task.service.ts` - 200 lines

## Refactor Recommendations

### Frontend

1. Add a real API layer:
   - `src/services/apiClient.js`
   - `src/services/authApi.js`
   - `src/services/workspaceApi.js`
   - `src/services/taskApi.js`
   - `src/services/goalApi.js`
   - `src/services/announcementApi.js`
   - `src/services/analyticsApi.js`
   - `src/services/userApi.js`
   - `src/services/notificationApi.js`

2. Split Zustand state by domain:
   - auth state
   - workspace state
   - task state
   - goal state
   - notification state
   - UI state

3. Keep UI components data-shape agnostic:
   - API adapters should convert backend enums and response formats.
   - Components should receive clean view models.

4. Break large pages into smaller components:
   - profile tabs
   - analytics charts/cards
   - task board/list/card/modal
   - announcement composer/card/reactions/comments
   - workspace members/settings/invite panels

5. Add socket client:
   - connect after auth
   - pass access token in `auth.token`
   - emit `join-workspace` when active workspace changes
   - update local stores from workspace events

### Backend

1. Keep existing auth design and complete missing flows:
   - add reset token persistence before enabling reset password
   - add real email verification persistence
   - document frontend cookie/access-token behavior

2. Reduce `workspace.nested.ts` over time:
   - keep route compatibility
   - move inline Prisma queries into services
   - add validation middleware for nested create/update routes
   - emit socket events from nested routes or route frontend through top-level modules

3. Align task statuses:
   - either add `REVIEW` to `TaskStatus`
   - or remove/rename frontend `review` column
   - document the intentional mapping

4. Apply validation consistently:
   - task list query
   - nested task/goal/announcement routes
   - analytics query params when filters are added

5. Split Swagger documentation:
   - keep generated spec export stable
   - move path groups into smaller docs files if docs are maintained manually

6. Add notification socket emission:
   - emit `notification-created` to user-specific rooms
   - keep workspace broadcasts for shared events

## Recommended Integration Order

1. Auth API client and auth store.
2. Workspace API and active workspace loading.
3. Dashboard layout auth guard and active workspace guard.
4. Tasks API integration with enum adapters.
5. Announcements API integration and socket events.
6. Goals API integration.
7. Analytics API integration.
8. Profile and notification preferences.
9. Export/audit activity.

## API Client Contract

Use the existing backend response shape:

```js
{
  success: true,
  status: 200,
  message: "Message",
  data: {}
}
```

Client rules:

- Base URL from `NEXT_PUBLIC_API_URL`.
- Always send `credentials: "include"` for refresh cookie support.
- Send `Authorization: Bearer ${accessToken}` when authenticated.
- Send `x-workspace-id` for top-level workspace-scoped endpoints.
- Unwrap `data.data` in service functions.
- Centralize 401 refresh retry in `apiClient.js`.

## Environment Documentation Needed

Frontend `.env` should be documented as:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Backend `.env` should document at least:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Final Assessment

The backend is not the blocker. It has a solid modular base and should be extended conservatively.

The main work is to replace frontend mock state with a professional API layer, split oversized UI files before wiring complex data, and make one clear choice between top-level workspace-scoped endpoints and nested workspace endpoints for frontend usage.
