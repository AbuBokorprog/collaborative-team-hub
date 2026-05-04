# 🚀 Collaborative Team Hub

A full-stack, real-time collaboration platform where teams can manage shared goals, track tasks, post announcements, and collaborate efficiently — all inside a single monorepo.

---

# 🧩 Project Overview

Collaborative Team Hub is a modern SaaS-style application designed for team productivity and coordination.

### Core Features

- 🔐 Authentication (JWT with httpOnly cookies)
- 🏢 Workspace-based collaboration
- 👥 Role-based access (Admin, Manager, Member)
- 🎯 Goals & task tracking with progress
- 📢 Announcements with reactions & comments
- 📊 Smart dashboard analytics (merged analytics view)
- ⚡ Real-time updates (Socket.io)
- 🔔 Notification system with deep linking
- 🟢 Online presence tracking
- 📁 File uploads (Cloudinary)

---

# 🏗 Monorepo Structure

```
apps/
  web/        → Next.js frontend (App Router, JS)
  api/        → Express backend (TypeScript)

packages/
  (optional shared packages)
```

---

# 🛠 Tech Stack

### Frontend

- Next.js 14 (App Router)
- JavaScript
- Tailwind CSS
- Zustand

### Backend

- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### Realtime

- Socket.io

### Auth

- JWT (access + refresh)
- Stored in httpOnly cookies

### Storage

- Cloudinary

### Deployment

- Vercel (separate services for frontend & backend)

---

# ⚙️ Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/AbuBokorprog/collaborative-team-hub
cd collaborative-team-hub
```

---

## 2. Install Dependencies

Using npm (recommended):

```bash
npm install
```

---

## 3. Setup Environment Variables

Create `.env` files in both apps:

### `/apps/api/.env`

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_ACCESS_EXPIRES_IN=
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=
COOKIE_SECRET=your_cookie_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

---

### `/apps/web/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 4. Setup Database

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

(Optional seed)

```bash
npx prisma db seed
```

---

## 5. Run Development Servers

From root:

```bash
pnpm dev
```

Or separately:

```bash
# backend
cd apps/api
pnpm dev

# frontend
cd apps/web
pnpm dev
```

---

## 6. Open App

Frontend:
http://localhost:3000

Backend:
http://localhost:5000

---

# 🔐 Authentication Flow

- Login/Register returns user + sets httpOnly cookies
- Frontend uses `credentials: include`
- Auto session restore via `/me`
- Refresh token used on 401
- Logout clears cookies

---

# 👥 Role-Based Access System

Each workspace has scoped roles:

| Role    | Permissions                                      |
| ------- | ------------------------------------------------ |
| Admin   | Full control, manage members, view all analytics |
| Manager | Manage tasks/goals, assign members               |
| Member  | Limited access, personal tasks & analytics       |

---

# ⚡ Advanced Features

## 1. Real-Time Collaboration (Socket.io)

Implemented:

- Live announcements
- Live task updates
- Live reactions/comments
- Online presence (workspace members)
- Real-time notifications

### How it works:

- Socket authenticated via JWT
- Users join workspace rooms
- Events broadcast to relevant users
- Zustand updates UI instantly

---

## 2. Smart Dashboard Analytics (Merged System)

Instead of separate analytics page:

- Analytics merged into dashboard
- Role-based data visibility:
  - Admin → full workspace analytics
  - Manager → team-level insights
  - Member → personal stats only

### Features:

- Task completion trends
- Goal progress
- Member workload
- Recent activity
- Date & range filtering
- CSV export (filtered data)

---

# 🎯 Goals & Task Progress System

- Each goal contains tasks
- Progress auto-calculated:

```
progress = completed_tasks / total_tasks
```

- Task statuses:

```
TODO → IN_PROGRESS → REVIEW → DONE
```

- Supports:
  - multi-assignee tasks
  - due dates
  - priority levels

---

# 🔔 Notification System

Supports:

- task assignment
- mentions (@user)
- announcements
- role changes
- reminders

### Features:

- Stored in DB
- Real-time via Socket.io
- Unread count
- Mark as read
- Deep linking to feature

Example:

```
/dashboard/tasks?id=123
```

---

# 🌐 Deployment (Railway)

## Services

- `apps/api` → backend service
- `apps/web` → frontend service

## Important Notes

- Enable CORS with credentials
- Use production domain in `CLIENT_URL`
- Cookies must be:
  - secure: true
  - sameSite: "none"

---

# ⚠️ Known Limitations

- ❗ No Redis adapter for Socket.io (scaling limitation)
- ❗ Notifications not batched (can be noisy)
- ❗ No offline support
- ❗ Limited role granularity (only 3 roles)
- ❗ No audit log UI (backend exists but not exposed)
- ❗ File uploads limited to Cloudinary only

---

# 📌 Future Improvements

- Redis for socket scaling
- Email notifications
- Role permission customization
- Mobile responsiveness improvements
- Activity timeline UI
- Pagination & infinite scroll
- Background jobs (queues)

---

# 🤝 Contribution

- Use conventional commits:

```
feat: add task assignment
fix: resolve auth bug
refactor: clean api service
```

- Keep PRs small and focused

---

# 📄 License

MIT License

---

# 💡 Final Note

This project demonstrates:

- real-world monorepo architecture
- production-grade backend design
- scalable frontend integration
- real-time system design

Perfect for SaaS-level applications.
