"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { analyticsApi } from "@/services/analytics-api";
import { announcementApi } from "@/services/announcement-api";
import { authApi } from "@/services/auth-api";
import { goalApi } from "@/services/goal-api";
import { taskApi } from "@/services/task-api";
import { setAccessToken } from "@/services/token-store";
import { workspaceApi } from "@/services/workspace-api";

const toUserView = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: user.role || "Member",
    avatar: user.avatar || user.name?.slice(0, 2).toUpperCase(),
    color: user.color || "#5b4fff",
    online: true,
  };
};

const toWorkspaceView = (workspace) => ({
  ...workspace,
  color: workspace.color || workspace.accentColor || "#5b4fff",
  plan: workspace.plan || "Workspace",
  members: workspace.members || 0,
});

const emptyTaskBoard = () => ({
  todo: [],
  inProgress: [],
  review: [],
  done: [],
});

const statusToColumn = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  DONE: "done",
};

const toTaskView = (task) => ({
  ...task,
  desc: task.description || task.desc || "",
  label: task.goal?.title || "General",
  priority: (task.priority || "MEDIUM").toLowerCase(),
  dueDate: task.dueDate?.slice?.(0, 10) || task.dueDate || "",
  assignee: task.assignee
    ? toUserView(task.assignee)
    : {
        name: "Unassigned",
        avatar: "?",
        color: "#64748b",
        online: false,
      },
});

const boardFromApi = (board) => {
  const next = emptyTaskBoard();

  for (const [column, tasks] of Object.entries(board || {})) {
    const target = next[column] ? column : statusToColumn[column] || "todo";
    next[target] = [...next[target], ...(tasks || []).map(toTaskView)];
  }

  return next;
};

const goalStatusToView = {
  PLANNED: "on-track",
  ACTIVE: "on-track",
  COMPLETED: "completed",
  BLOCKED: "behind",
};

const goalStatusToApi = {
  "on-track": "ACTIVE",
  "at-risk": "ACTIVE",
  behind: "BLOCKED",
  completed: "COMPLETED",
};

const toGoalView = (goal) => {
  const milestones = goal.milestones || [];
  const progress = milestones.length
    ? Math.round(
        milestones.reduce((total, item) => total + item.progressPercentage, 0) /
          milestones.length,
      )
    : goal.status === "COMPLETED"
      ? 100
      : 0;

  return {
    ...goal,
    status: goalStatusToView[goal.status] || goal.status || "on-track",
    progress,
    dueDate: goal.dueDate
      ? new Date(goal.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No date",
    priority: "medium",
    team: [toUserView(goal.owner)].filter(Boolean),
  };
};

const reactionCounts = (reactions) => {
  if (!Array.isArray(reactions)) {
    return reactions || {};
  }

  return reactions.reduce((result, reaction) => {
    result[reaction.emoji] = (result[reaction.emoji] || 0) + 1;
    return result;
  }, {});
};

const toAnnouncementView = (announcement) => ({
  ...announcement,
  author: toUserView(announcement.author),
  reactions: reactionCounts(announcement.reactions),
  comments: announcement._count?.comments || announcement.comments?.length || 0,
  audience: "All",
});

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
      authLoading: false,
      authError: "",
      login: async (email, password) => {
        set({ authLoading: true, authError: "" });

        try {
          const data = await authApi.login({ email, password });
          set({
            isAuthenticated: true,
            currentUser: toUserView(data.user),
            authLoading: false,
          });
          await get().loadWorkspaces();
          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            authLoading: false,
            authError: error.message || "Unable to sign in",
          });
          return false;
        }
      },
      register: async ({ name, email, password, workspaceName }) => {
        set({ authLoading: true, authError: "" });

        try {
          const data = await authApi.register({
            name,
            email,
            password,
            workspaceName,
          });
          set({
            isAuthenticated: true,
            currentUser: toUserView(data.user),
            authLoading: false,
          });
          await get().loadWorkspaces();
          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            authLoading: false,
            authError: error.message || "Unable to create account",
          });
          return false;
        }
      },
      hydrateSession: async () => {
        if (get().authLoading) {
          return;
        }

        set({ authLoading: true, authError: "" });

        try {
          const user = await authApi.me();
          set({
            isAuthenticated: true,
            currentUser: toUserView(user),
            authLoading: false,
          });
          await get().loadWorkspaces();
        } catch {
          setAccessToken(null);
          set({
            isAuthenticated: false,
            authLoading: false,
            currentUser: null,
          });
        }
      },
      logout: async () => {
        await authApi.logout();
        set({
          isAuthenticated: false,
          currentUser: null,
          activeWorkspace: null,
          workspaces: [],
        });
      },

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
      workspaceStats: null,
      workspaceMembers: [],
      workspaceActivity: [],
      loadWorkspaces: async () => {
        try {
          const rows = await workspaceApi.list();
          const workspaces = rows.map(toWorkspaceView);
          set({
            workspaces,
            activeWorkspace: workspaces[0] || null,
          });
          return workspaces;
        } catch (error) {
          set({ authError: error.message || "Unable to load workspaces" });
          return [];
        }
      },
      loadWorkspaceDetails: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          const [members, stats] = await Promise.all([
            workspaceApi.members(workspaceId),
            workspaceApi.stats(workspaceId),
          ]);
          const users = members.map((member) =>
            toUserView({ ...member.user, role: member.role }),
          );

          set({ workspaceMembers: members, workspaceStats: stats, users });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to load workspace",
          };
        }
      },
      inviteMember: async (
        payload,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          await workspaceApi.invite(workspaceId, payload);
          await get().loadWorkspaceDetails(workspaceId);
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to invite member",
          };
        }
      },
      createWorkspace: async (payload) => {
        try {
          const workspace = await workspaceApi.create(payload);
          const wsView = toWorkspaceView(workspace);
          set((state) => ({ workspaces: [...state.workspaces, wsView] }));
          return { ok: true, workspace: wsView };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to create workspace" };
        }
      },
      loadWorkspaceActivity: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) return;
        try {
          const data = await analyticsApi.recentActivity(workspaceId);
          set({ workspaceActivity: Array.isArray(data) ? data : [] });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to load activity" };
        }
      },
      updateWorkspace: async (
        payload,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          const workspace = await workspaceApi.update(workspaceId, payload);
          const next = toWorkspaceView(workspace);
          set((state) => ({
            activeWorkspace: { ...state.activeWorkspace, ...next },
            workspaces: state.workspaces.map((item) =>
              item.id === workspaceId ? { ...item, ...next } : item,
            ),
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to update workspace",
          };
        }
      },

      // Users
      users: USERS,

      // Tasks
      tasks: INITIAL_TASKS,
      tasksLoading: false,
      tasksError: "",
      taskView: "kanban",
      setTaskView: (v) => set({ taskView: v }),
      loadTasks: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return;
        }

        set({ tasksLoading: true, tasksError: "" });

        try {
          const result = await taskApi.board(workspaceId);
          set({
            tasks: boardFromApi(result.board),
            tasksLoading: false,
          });
          return { ok: true };
        } catch (error) {
          set({
            tasksLoading: false,
            tasksError: error.message || "Unable to load tasks",
          });
          return { ok: false, error: error.message || "Unable to load tasks" };
        }
      },
      moveTask: async (taskId, fromCol, toCol) => {
        const tasks = get().tasks;
        const task = tasks[fromCol].find((t) => t.id === taskId);
        if (!task) {
          return { ok: false, error: "Task not found" };
        }

        set({
          tasks: {
            ...tasks,
            [fromCol]: tasks[fromCol].filter((t) => t.id !== taskId),
            [toCol]: [...tasks[toCol], task],
          },
        });

        const workspaceId = get().activeWorkspace?.id;
        if (!workspaceId) {
          return { ok: true };
        }

        try {
          await taskApi.move(workspaceId, taskId, toCol);
          return { ok: true };
        } catch (error) {
          set({
            tasks,
            tasksError: error.message || "Unable to move task",
          });
          return { ok: false, error: error.message || "Unable to move task" };
        }
      },
      addTask: async (column, task) => {
        const tasks = get().tasks;
        const workspaceId = get().activeWorkspace?.id;
        const optimisticId = `pending-${Date.now()}`;
        const newTask = { ...task, id: optimisticId };

        set({ tasks: { ...tasks, [column]: [...tasks[column], newTask] } });

        if (!workspaceId) {
          return { ok: true };
        }

        try {
          const created = await taskApi.create(workspaceId, {
            title: task.title,
            description: task.desc,
            priority: task.priority,
            dueDate: task.dueDate || undefined,
            goalId: task.goalId || undefined,
            column,
          });
          set((state) => ({
            tasks: {
              ...state.tasks,
              [column]: state.tasks[column].map((item) =>
                item.id === optimisticId ? toTaskView(created) : item,
              ),
            },
          }));
          return { ok: true };
        } catch (error) {
          set({
            tasks,
            tasksError: error.message || "Unable to create task",
          });
          return { ok: false, error: error.message || "Unable to create task" };
        }
      },

      updateTask: async (taskId, col, payload) => {
        const workspaceId = get().activeWorkspace?.id;
        if (!workspaceId) return { ok: false, error: "No active workspace" };
        try {
          const updated = await taskApi.update(workspaceId, taskId, payload);
          set((state) => ({
            tasks: {
              ...state.tasks,
              [col]: state.tasks[col].map((t) =>
                t.id === taskId ? { ...t, ...toTaskView(updated) } : t,
              ),
            },
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to update task" };
        }
      },
      deleteTask: async (taskId, col) => {
        const snapshot = get().tasks;
        const workspaceId = get().activeWorkspace?.id;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [col]: state.tasks[col].filter((t) => t.id !== taskId),
          },
        }));
        if (!workspaceId) return { ok: true };
        try {
          await taskApi.remove(workspaceId, taskId);
          return { ok: true };
        } catch (error) {
          set({ tasks: snapshot });
          return { ok: false, error: error.message || "Unable to delete task" };
        }
      },

      // Goals
      goals: INITIAL_GOALS,
      goalsLoading: false,
      loadGoals: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return;
        }

        set({ goalsLoading: true });

        try {
          const result = await goalApi.list(workspaceId);
          set({
            goals: (result.data || result || []).map(toGoalView),
            goalsLoading: false,
          });
          return { ok: true };
        } catch (error) {
          set({ goalsLoading: false });
          return { ok: false, error: error.message || "Unable to load goals" };
        }
      },
      createGoal: async (payload, workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          const created = await goalApi.create(workspaceId, {
            title: payload.title,
            description: payload.description,
            dueDate: payload.dueDate || undefined,
            status: goalStatusToApi[payload.status] || "ACTIVE",
          });
          set((state) => ({ goals: [toGoalView(created), ...state.goals] }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to create goal" };
        }
      },
      updateGoalProgress: async (id, progress) => {
        const goals = get().goals;
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
        }));

        const workspaceId = get().activeWorkspace?.id;
        if (!workspaceId) {
          return;
        }

        try {
          await goalApi.progress(workspaceId, id, progress);
          return { ok: true };
        } catch (error) {
          set({ goals });
          return {
            ok: false,
            error: error.message || "Unable to update progress",
          };
        }
      },

      // Announcements
      announcements: INITIAL_ANNOUNCEMENTS,
      announcementsLoading: false,
      loadAnnouncements: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return;
        }

        set({ announcementsLoading: true });

        try {
          const result = await announcementApi.list(workspaceId);
          set({
            announcements: (result.data || result || []).map(
              toAnnouncementView,
            ),
            announcementsLoading: false,
          });
          return { ok: true };
        } catch (error) {
          set({ announcementsLoading: false });
          return {
            ok: false,
            error: error.message || "Unable to load announcements",
          };
        }
      },
      addAnnouncement: async (ann, workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          const created = await announcementApi.create(workspaceId, ann);
          set((s) => ({
            announcements: [toAnnouncementView(created), ...s.announcements],
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to create announcement",
          };
        }
      },
      announcementComments: {},
      loadAnnouncementComments: async (
        announcementId,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) return { ok: false, error: "No active workspace" };
        try {
          const data = await announcementApi.getComments(workspaceId, announcementId);
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: Array.isArray(data) ? data : [],
            },
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to load comments" };
        }
      },
      commentOnAnnouncement: async (
        announcementId,
        body,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) return { ok: false, error: "No active workspace" };
        try {
          const comment = await announcementApi.comment(workspaceId, announcementId, body);
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: [
                ...(state.announcementComments[announcementId] || []),
                comment,
              ],
            },
            announcements: state.announcements.map((ann) =>
              ann.id === announcementId
                ? { ...ann, comments: ann.comments + 1 }
                : ann,
            ),
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to add comment" };
        }
      },
      reactToAnnouncement: async (
        announcementId,
        emoji,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          await announcementApi.react(workspaceId, announcementId, emoji);
          set((state) => ({
            announcements: state.announcements.map((announcement) => {
              if (announcement.id !== announcementId) {
                return announcement;
              }

              return {
                ...announcement,
                reactions: {
                  ...announcement.reactions,
                  [emoji]: (announcement.reactions[emoji] || 0) + 1,
                },
              };
            }),
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to react" };
        }
      },

      // Dashboard
      dashboardStats: null,
      dashboardLoading: false,
      taskCompletionChart: null,
      loadDashboard: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return;
        }

        set({ dashboardLoading: true });

        try {
          const [dashboard, overview, taskCompletion] = await Promise.all([
            analyticsApi.dashboard(workspaceId),
            analyticsApi.overview(workspaceId),
            analyticsApi.taskCompletion(workspaceId).catch(() => null),
          ]);
          set({
            dashboardStats: { dashboard, overview },
            taskCompletionChart: taskCompletion?.months || null,
            dashboardLoading: false,
          });
          return { ok: true };
        } catch (error) {
          set({ dashboardLoading: false });
          return {
            ok: false,
            error: error.message || "Unable to load dashboard",
          };
        }
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
        currentUser: s.currentUser,
        activeWorkspace: s.activeWorkspace,
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
