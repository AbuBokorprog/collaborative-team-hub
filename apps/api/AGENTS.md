# Collaborative Team Hub — Full Project Execution Guide

## Purpose

Build a production-ready full-stack web application called **Collaborative Team Hub**.

This platform helps teams collaborate inside shared workspaces where members can:

- Manage goals
- Break goals into milestones
- Track tasks/action items
- Publish announcements
- Comment/react in real time
- See online members
- Receive mention notifications
- View analytics
- Export data

This document explains the product deeply so any AI coding agent can understand architecture, workflows, relationships, priorities, and implementation expectations.

---

# 1. Product Vision

A modern SaaS team productivity platform combining:

- Slack-style communication
- Trello/Jira task management
- Notion-style workspace organization
- ClickUp-style dashboards

Target users:

- Startups
- Agencies
- Remote teams
- Product teams
- Internal company teams

---

# 2. Core Problems Solved

Without this platform teams face:

- Scattered communication
- No task ownership
- Poor deadline tracking
- No progress visibility
- Hard multi-project management
- No real-time collaboration
- No analytics

This app solves by centralizing collaboration.

---

# 3. Tech Stack (Mandatory)

## Monorepo

- Turborepo

## Frontend

- Next.js 14+
- App Router
- JavaScript only
- Tailwind CSS
- Zustand

## Backend

- Node.js
- Express.js
- REST API

## Database

- PostgreSQL
- Prisma ORM

## Auth

- JWT access token
- Refresh token
- httpOnly cookies

## Realtime

- Socket.io

## File Upload

- Cloudinary

## Charts

- Recharts

## Deploy

- Railway

---

# 4. Monorepo Structure

```txt
/apps
  /web     -> Next.js frontend
  /api     -> Express backend

/packages
  /ui
  /utils
  /config
```

````

---

# 5. User Roles

## Admin

Can:

- Manage workspace
- Invite members
- Remove members
- Create announcements
- Pin announcements
- Create goals
- Create tasks
- View analytics
- Export CSV

## Member

Can:

- View workspace
- Update assigned tasks
- Comment
- React
- Post progress updates
- Receive notifications

---

# 6. Main Product Modules

---

# Authentication Module

## Features

- Register with email/password
- Login
- Logout
- Token refresh
- Protected routes
- User profile
- Avatar upload

## Real World Purpose

Protect company data and identify users.

## APIs

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/me
PATCH /api/users/profile
POST /api/users/avatar
```

---

# Workspace Module

## Features

- Create workspace
- Switch workspace
- Workspace branding
- Invite users by email
- Role assignment

## Workspace Fields

- name
- description
- accentColor

## Real World Purpose

Separate teams/projects into isolated environments.

## APIs

```txt
GET /api/workspaces
POST /api/workspaces
GET /api/workspaces/:id
PATCH /api/workspaces/:id
POST /api/workspaces/:id/invite
GET /api/workspaces/:id/members
PATCH /api/workspaces/:id/member/:userId
```

---

# Goals Module

## Features

Create strategic objectives.

Example:

- Launch Website
- Increase Sales
- Release Mobile App

## Fields

- title
- owner
- dueDate
- status

## Purpose

Align all tasks under meaningful outcomes.

## APIs

```txt
GET /api/goals
POST /api/goals
GET /api/goals/:id
PATCH /api/goals/:id
DELETE /api/goals/:id
```

---

# Milestones Module

## Features

Break goals into smaller measurable parts.

Example:

Goal: Launch App

Milestones:

- UI Complete
- Backend Complete
- QA Complete
- Release Complete

## Fields

- title
- progressPercentage

## APIs

```txt
POST /api/goals/:id/milestones
PATCH /api/milestones/:id
DELETE /api/milestones/:id
```

---

# Goal Activity Feed

## Features

Users post progress updates.

Examples:

- Payment gateway integrated
- Dashboard completed
- Testing started

## Purpose

Keep team informed without meetings.

## APIs

```txt
POST /api/goals/:id/updates
GET /api/goals/:id/activity
```

---

# Announcements Module

## Features

Admins can broadcast messages.

Examples:

- Tomorrow holiday
- Production deployment tonight
- Team meeting at 4PM

## Rich Text Required

Support formatted content.

## Extra Features

- Emoji reactions
- Comments
- Pin to top

## APIs

```txt
GET /api/announcements
POST /api/announcements
PATCH /api/announcements/:id
DELETE /api/announcements/:id
POST /api/announcements/:id/react
POST /api/announcements/:id/comment
POST /api/announcements/:id/pin
```

---

# Action Items / Tasks Module

## Features

Daily executable work items.

Examples:

- Build login page
- Fix bug
- Write API docs

## Fields

- title
- assignee
- priority
- dueDate
- status
- linkedGoal

## Views

### Kanban(draggable)

Todo | In Progress | Done

### List

Table/grid view

## APIs

```txt
GET /api/tasks
POST /api/tasks
PATCH /api/tasks/:id
DELETE /api/tasks/:id
```

---

# Realtime Module

Use Socket.io

## Live Events

- new announcement
- task status changed
- reaction added
- user online
- comment posted
- mention notification

## Purpose

No page refresh required.

## Socket Events

```txt
join-workspace
online-users
task-updated
goal-updated
new-announcement
notification
```

---

# Presence / Online Users

## Features

Show who is online in workspace now.

## Purpose

Know who is available instantly.

---

# Mention Notifications

## Example

@John please review task.

John receives in-app notification.

## APIs

```txt
GET /api/notifications
PATCH /api/notifications/:id/read
```

---

# Analytics Module

## Dashboard Cards

- Total goals
- Completed this week
- Overdue tasks
- Active members

## Charts

- Goal completion chart
- Weekly productivity chart

## APIs

```txt
GET /api/analytics/dashboard
```

---

# CSV Export

Export workspace data.

## APIs

```txt
GET /api/export/csv
```

---

# 7. Recommended Advanced Features (Choose 2)

## Best Choices

### Optimistic UI

Immediately update UI before server response.

Examples:

- Task moved instantly
- Reaction appears instantly

Rollback on failure.

### Audit Log

Track immutable actions:

- Task created
- Goal updated
- Member invited
- Announcement pinned

Useful for recruiters.

---

# 8. Suggested Database Models

```txt
User
Workspace
Membership
Goal
Milestone
GoalUpdate
Task
Announcement
Comment
Reaction
Notification
AuditLog
RefreshToken
```

---

# 9. Critical Relationships

```txt
User -> many memberships
Workspace -> many members
Workspace -> many goals
Workspace -> many tasks
Workspace -> many announcements

Goal -> many milestones
Goal -> many tasks
Goal -> many updates

Task -> assigned user

Announcement -> comments/reactions

User -> notifications
```

---

# 10. Frontend Pages

```txt
(auth)/login
(auth)/register
(dashboard)/dashboard
    /dashboard/workspaces
    /workspace/[id]
    /dashboard/goals
    /dashboard/tasks
    /dashboard/announcements
    /dashboard/analytics
    /dashboard/profile
/
```

---

# 11. State Management (Zustand)

Stores:

```txt
authStore
workspaceStore
goalStore
taskStore
notificationStore
uiStore
socketStore
```

---

# 12. UI Expectations

Modern SaaS style.

Use:

- shadcn/ui
- Tailwind CSS
- Lucide icons
- Recharts
- Framer Motion

Visual style:

- Rounded cards
- Sidebar navigation
- Responsive layout
- Light/dark mode
- Smooth transitions

---

# 13. Backend Architecture

```txt
prisma/
src/
  app/
    routes/
    config/
    docs/
    helpers/
    utils/
    sockets/
    modules/
        auth/
          authConstants.ts
          authController.ts
          authInterface.ts
          authRoute.ts
          authService.ts
          authValidation.ts
    middlewares
  app.ts
  server.ts
```

---

# 14. Security Requirements

- Password hashing (bcrypt)
- JWT signed tokens
- Refresh token rotation
- httpOnly cookies
- Role-based authorization
- Input validation
- CORS configured
- Rate limiting optional

---

# 15. Deployment Requirements

Railway with 2 services:

## Web

Next.js frontend

## API

Express backend

## DB

Railway PostgreSQL

---

# 16. Environment Variables

## Backend

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

---

# 18. Coding Standards

- Conventional commits
- Reusable components
- Clean folder structure
- REST naming consistency
- Error handling middleware
- Loading states
- Empty states
- Responsive design

---

# 19. Success Criteria

Project should feel like a real startup product, not CRUD demo.

Must demonstrate:

- Full-stack skill
- Architecture thinking
- Product thinking
- Real-time systems
- Good UX
- Production readiness

---

# 20. Final Goal

When reviewer opens project they should think:

"This candidate can build and ship real products."

```
````
