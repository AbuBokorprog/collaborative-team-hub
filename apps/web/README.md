# 📦 Apps Overview — Collaborative Team Hub

This document provides **app-specific documentation** for each service inside the monorepo.

# 🌐 apps/web — Frontend Application

## Overview

Frontend is a modern **Next.js 16 App Router** application focused on:

- real-time UX
- clean dashboard UI
- seamless API integration

Built with:

- Next.js (App Router)
- JavaScript (no TypeScript)
- Tailwind CSS
- Zustand (state management)

---

## 📁 Structure

```id="tpmw6s"
src/

app/
  (auth)/
    login/
    register/

  (dashboard)/dashboard/
    analytics/
    announcements/
    goals/
    profile/
    tasks/
    workspace/

components/
  ui/
  common/
  pages/

services/
hooks/
store/
utils/
```

---

## 🚀 Running Locally

```bash id="oj5w5k"
cd apps/web
npm install
npm dev
```

---

## 🌍 Environment Variables

```env id="cs2qdf"
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🔑 Core Features

### Authentication UI

- Login / Register pages
- Session persistence
- Auto redirect for protected routes

---

### Dashboard (Main Hub)

- Role-based data visibility
- Task overview
- Goal progress
- Activity feed

---

### Task Management

- Kanban board
- Drag & drop
- Live updates
- Multi-assignee support

---

### Goals Tracking

- Progress visualization
- Task-based calculation
- Status tracking

---

### Announcements

- Post updates
- Reactions
- Comments
- Real-time sync

---

### Notifications

- Real-time notifications
- Unread count
- Deep linking

---

### Online Presence

- Show active workspace members
- Live updates via Socket.io

---

## 🔌 API Integration

- Centralized service layer (`/services`)
- Uses `fetch` or axios wrapper
- Includes credentials (cookies)
- Handles 401 with refresh logic

---

## 🧠 State Management (Zustand)

Global state includes:

- current user
- workspace
- tasks
- goals
- announcements
- notifications

---

## ⚠️ Limitations

- Large Zustand store (needs modularization)
- No full offline support
- Limited accessibility optimizations

---

## 🎨 UI Notes

- Tailwind-based design
- Reusable UI components
- Focus on SaaS dashboard experience

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
