# 📦 Apps Overview — Collaborative Team Hub

This document provides **app-specific documentation** for each service inside the monorepo.

# 🧠 apps/api — Backend Service

## Overview

The backend is a **modular, scalable REST API** built with:

- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication (httpOnly cookies)
- Socket.io (real-time)

It handles:

- authentication
- workspace & role management
- tasks & goals
- announcements
- analytics
- notifications
- real-time communication

---

## 📁 Structure

```id="x4czr9"
src/
  app/
    config/
    middlewares/
    modules/
      auth/
      users/
      workspaces/
      tasks/
      goals/
      announcements/
      notifications/
      analytics/
    routers/
    sockets/
    utils/

prisma/
  schema.prisma
```

---

## 🚀 Running Locally

```bash id="m5wqz6"
cd apps/api
npm install
npm dev
```

---

## 🔐 Environment Variables

```env id="07t6tm"
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

## 🔑 Core Features

### Authentication

- JWT access + refresh tokens
- stored in httpOnly cookies
- secure, stateless auth

---

### Workspace & Roles

- Workspace-based collaboration
- Roles:
  - ADMIN
  - MANAGER
  - MEMBER

- Role-based middleware protection

---

### Tasks & Goals

- Kanban-style task system
- Multi-user assignment
- Goal progress auto-calculated from tasks

---

### Analytics Engine

- Aggregated workspace analytics
- Role-based filtering
- Time-based queries

---

### Notifications System

- Stored in database
- Supports:
  - user-specific
  - workspace-wide

- Real-time delivery via Socket.io

---

### Realtime (Socket.io)

- Workspace rooms
- Live updates:
  - tasks
  - announcements
  - notifications
  - presence

---

## 🔌 API Design

- RESTful structure
- Modular route system
- Standard response format:

```json id="l8v3s0"
{
  "success": true,
  "message": "",
  "data": {}
}
```

---

## ⚠️ Limitations

- No Redis adapter for Socket.io (single-instance scaling)
- No background job queue
- Limited rate limiting

# Seeded Data for DEMO

Workspace: Acme Corp

_6 users (all password: Password123!):_

#### Email Role

- sarah@demo.com Admin
- james@demo.com Manager
- priya@demo.com Manager
- alex@demo.com Member
- emma@demo.com Member
- tom@demo.com Member

# 🔗 How Both Apps Work Together

```id="a5m2fg"
Frontend (Next.js)
        ↓ API calls
Backend (Express)
        ↓
Database (PostgreSQL)

Realtime:
Frontend ⇄ Socket.io ⇄ Backend
```
