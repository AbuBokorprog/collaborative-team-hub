"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const USERS = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@teamhub.io",
    role: "Product Lead",
    avatar: "AC",
    color: "#5b4fff",
    online: true,
  },
  {
    id: 2,
    name: "Sarah Kim",
    email: "sarah@teamhub.io",
    role: "Designer",
    avatar: "SK",
    color: "#e11d48",
    online: true,
  },
  {
    id: 3,
    name: "Marcus Johnson",
    email: "marcus@teamhub.io",
    role: "Engineer",
    avatar: "MJ",
    color: "#0891b2",
    online: false,
  },
  {
    id: 4,
    name: "Priya Patel",
    email: "priya@teamhub.io",
    role: "Engineer",
    avatar: "PP",
    color: "#16a34a",
    online: true,
  },
  {
    id: 5,
    name: "Tom Wright",
    email: "tom@teamhub.io",
    role: "Marketing",
    avatar: "TW",
    color: "#d97706",
    online: false,
  },
];

const INITIAL_TASKS = {
  todo: [
    {
      id: "t1",
      title: "Design system audit",
      priority: "high",
      assignee: USERS[1],
      label: "Design",
      dueDate: "2025-02-15",
      desc: "Review all components for consistency",
    },
    {
      id: "t2",
      title: "API rate limiting",
      priority: "medium",
      assignee: USERS[2],
      label: "Backend",
      dueDate: "2025-02-20",
      desc: "Implement rate limiting middleware",
    },
    {
      id: "t3",
      title: "Onboarding flow",
      priority: "low",
      assignee: USERS[0],
      label: "Product",
      dueDate: "2025-03-01",
      desc: "Redesign user onboarding experience",
    },
  ],
  inProgress: [
    {
      id: "t4",
      title: "Q1 Dashboard redesign",
      priority: "high",
      assignee: USERS[0],
      label: "Design",
      dueDate: "2025-02-10",
      desc: "Overhaul main dashboard metrics",
    },
    {
      id: "t5",
      title: "Auth 2FA integration",
      priority: "high",
      assignee: USERS[3],
      label: "Security",
      dueDate: "2025-02-12",
      desc: "Add TOTP-based 2FA support",
    },
    {
      id: "t6",
      title: "Mobile responsive fixes",
      priority: "medium",
      assignee: USERS[1],
      label: "Frontend",
      dueDate: "2025-02-18",
      desc: "Fix layout issues on small screens",
    },
  ],
  review: [
    {
      id: "t7",
      title: "Payment gateway v2",
      priority: "high",
      assignee: USERS[3],
      label: "Backend",
      dueDate: "2025-02-08",
      desc: "Stripe v2 API migration",
    },
    {
      id: "t8",
      title: "Email templates",
      priority: "low",
      assignee: USERS[4],
      label: "Marketing",
      dueDate: "2025-02-25",
      desc: "New transactional email designs",
    },
  ],
  done: [
    {
      id: "t9",
      title: "CI/CD pipeline setup",
      priority: "medium",
      assignee: USERS[2],
      label: "DevOps",
      dueDate: "2025-02-01",
      desc: "GitHub Actions deployment pipeline",
    },
    {
      id: "t10",
      title: "User analytics events",
      priority: "low",
      assignee: USERS[0],
      label: "Product",
      dueDate: "2025-01-30",
      desc: "Track key conversion events",
    },
  ],
};

const INITIAL_GOALS = [
  {
    id: "g1",
    title: "Launch v2.0 Platform",
    description: "Complete platform redesign with new features",
    progress: 68,
    target: 100,
    status: "on-track",
    dueDate: "Mar 31",
    team: [USERS[0], USERS[1], USERS[2]],
    priority: "high",
  },
  {
    id: "g2",
    title: "Reach 10K Active Users",
    description: "Growth through product-led acquisition",
    progress: 42,
    target: 100,
    status: "at-risk",
    dueDate: "Jun 30",
    team: [USERS[0], USERS[4]],
    priority: "high",
  },
  {
    id: "g3",
    title: "99.9% Uptime SLA",
    description: "Infrastructure reliability improvements",
    progress: 91,
    target: 100,
    status: "on-track",
    dueDate: "Ongoing",
    team: [USERS[2], USERS[3]],
    priority: "medium",
  },
  {
    id: "g4",
    title: "Security Certifications",
    description: "SOC2 Type II and ISO 27001",
    progress: 25,
    target: 100,
    status: "behind",
    dueDate: "Dec 31",
    team: [USERS[3]],
    priority: "medium",
  },
  {
    id: "g5",
    title: "Team Growth to 20 FTEs",
    description: "Expand engineering and design teams",
    progress: 60,
    target: 100,
    status: "on-track",
    dueDate: "Sep 30",
    team: [USERS[0]],
    priority: "low",
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "🚀 Q1 Planning Week Kickoff",
    content:
      "Hey team! Q1 planning starts Monday. Please review the roadmap doc before the all-hands. Bring your biggest ideas — we're setting bold targets this quarter.",
    author: USERS[0],
    createdAt: "2025-02-05T09:00:00Z",
    pinned: true,
    reactions: { "🎉": 8, "💪": 5, "👀": 3 },
    comments: 4,
    audience: "All",
  },
  {
    id: "a2",
    title: "✨ New Design System Released",
    content:
      "Our component library v3 is live! Check Figma for the updated tokens. Engineering team — the npm package is published at @teamhub/ui@3.0.0.",
    author: USERS[1],
    createdAt: "2025-02-04T14:30:00Z",
    pinned: false,
    reactions: { "🔥": 12, "❤️": 6 },
    comments: 7,
    audience: "Engineering",
  },
  {
    id: "a3",
    title: "🎉 Welcome Marcus to the Team!",
    content:
      "Please give a warm welcome to Marcus Johnson, our new Senior Backend Engineer. Marcus comes from Stripe and will be leading our payments infrastructure work.",
    author: USERS[0],
    createdAt: "2025-02-03T10:00:00Z",
    pinned: false,
    reactions: { "👋": 15, "🎉": 10, "🙌": 8 },
    comments: 12,
    audience: "All",
  },
];

const WORKSPACES = [
  { id: "w1", name: "TeamHub HQ", plan: "Pro", members: 5, color: "#5b4fff" },
  {
    id: "w2",
    name: "Client Projects",
    plan: "Business",
    members: 12,
    color: "#e11d48",
  },
  {
    id: "w3",
    name: "Side Ventures",
    plan: "Free",
    members: 3,
    color: "#16a34a",
  },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    type: "mention",
    text: "Sarah mentioned you in Q1 Dashboard",
    time: "2m ago",
    read: false,
    avatar: USERS[1],
  },
  {
    id: "n2",
    type: "task",
    text: "Auth 2FA integration moved to Review",
    time: "15m ago",
    read: false,
    avatar: USERS[3],
  },
  {
    id: "n3",
    type: "goal",
    text: 'Q1 goal "10K Users" updated to 42%',
    time: "1h ago",
    read: true,
    avatar: USERS[0],
  },
  {
    id: "n4",
    type: "comment",
    text: "Tom commented on Payment gateway v2",
    time: "3h ago",
    read: true,
    avatar: USERS[4],
  },
  {
    id: "n5",
    type: "announcement",
    text: "New announcement: Design System v3",
    time: "1d ago",
    read: true,
    avatar: USERS[1],
  },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      currentUser: USERS[0],
      isAuthenticated: false,
      login: (email, password) => {
        set({ isAuthenticated: true, currentUser: USERS[0] });
        return true;
      },
      logout: () => set({ isAuthenticated: false }),

      // Theme
      theme: "light",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      mobileSidebarOpen: false,
      toggleMobileSidebar: () =>
        set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),

      // Workspace
      workspaces: WORKSPACES,
      activeWorkspace: WORKSPACES[0],
      setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),

      // Users
      users: USERS,

      // Tasks
      tasks: INITIAL_TASKS,
      taskView: "kanban",
      setTaskView: (v) => set({ taskView: v }),
      moveTask: (taskId, fromCol, toCol) => {
        const tasks = get().tasks;
        const task = tasks[fromCol].find((t) => t.id === taskId);
        if (!task) {return;}
        set({
          tasks: {
            ...tasks,
            [fromCol]: tasks[fromCol].filter((t) => t.id !== taskId),
            [toCol]: [...tasks[toCol], task],
          },
        });
      },
      addTask: (column, task) => {
        const tasks = get().tasks;
        const newTask = { ...task, id: `t${Date.now()}` };
        set({ tasks: { ...tasks, [column]: [...tasks[column], newTask] } });
      },

      // Goals
      goals: INITIAL_GOALS,
      updateGoalProgress: (id, progress) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
        })),

      // Announcements
      announcements: INITIAL_ANNOUNCEMENTS,
      addAnnouncement: (ann) => {
        const newAnn = {
          ...ann,
          id: `a${Date.now()}`,
          createdAt: new Date().toISOString(),
          reactions: {},
          comments: 0,
        };
        set((s) => ({ announcements: [newAnn, ...s.announcements] }));
      },

      // Notifications
      notifications: NOTIFICATIONS,
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: "teamhub-storage",
      partialize: (s) => ({
        theme: s.theme,
        isAuthenticated: s.isAuthenticated,
        sidebarOpen: s.sidebarOpen,
      }),
    },
  ),
);

export {
  USERS,
  INITIAL_TASKS,
  INITIAL_GOALS,
  INITIAL_ANNOUNCEMENTS,
  WORKSPACES,
};
