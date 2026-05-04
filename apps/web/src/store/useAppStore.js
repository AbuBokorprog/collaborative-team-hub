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
  return {
    ...goal,
    status: goalStatusToView[goal.status] || goal.status || "on-track",
    progress: goal.progress,
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

const toAnnouncementView = (announcement, currentUserId) => {
  const myReactionObj = announcement.reactions?.find(
    (r) => r.userId === currentUserId,
  );

  return {
    ...announcement,
    commentsCount:
      announcement._count?.comments || announcement.comments?.length || 0,
    reactionsCount:
      announcement._count?.reactions || announcement.reactions?.length || 0,
    reactions: reactionCounts(announcement.reactions),
    hasReacted: !!myReactionObj,
    myReaction: myReactionObj?.emoji || null,
  };
};

// const toNotificationView = (notification) => ({
//   ...notification,
//   text: notification.body || notification.title,
//   time: notification.createdAt
//     ? new Date(notification.createdAt).toLocaleString()
//     : "",
//   type: notification.type?.toLowerCase?.() || "system",
// });

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
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
          const activeWorkspaceId = get().activeWorkspace?.id;
          const membership = user.memberships?.find(
            (m) => m.workspaceId === activeWorkspaceId,
          );
          set({
            isAuthenticated: true,
            currentUser: toUserView({
              ...user,
              role: membership?.role || user.role,
            }),
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
      workspaces: null,
      activeWorkspace: null,
      setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),
      workspaceStats: null,
      workspaceMembers: [],
      workspaceActivity: [],
      loadWorkspaces: async () => {
        try {
          const rows = await workspaceApi.list();
          const workspaces = rows.map(toWorkspaceView);

          const savedWorkspace = get().activeWorkspace;

          const matchedWorkspace = workspaces.find(
            (w) => w.id === savedWorkspace?.id,
          );

          set({
            workspaces,
            activeWorkspace: matchedWorkspace || workspaces[0] || null,
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

          const currentUserId = get().currentUser?.id;
          const myMembership = members.find(
            (m) => (m.user?.id || m.userId) === currentUserId,
          );
          set((state) => ({
            workspaceMembers: members,
            workspaceStats: stats,
            users,
            ...(myMembership
              ? {
                  currentUser: {
                    ...state.currentUser,
                    role: myMembership.role,
                  },
                }
              : {}),
          }));
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
          return {
            ok: false,
            error: error.message || "Unable to create workspace",
          };
        }
      },
      loadWorkspaceActivity: async (
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return;
        }
        try {
          const data = await analyticsApi.recentActivity(workspaceId);
          set({ workspaceActivity: Array.isArray(data) ? data : [] });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to load activity",
          };
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
      users: [],
      loadUsers: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace selected" };
        }

        try {
          const members = await workspaceApi.members(workspaceId);

          const users = members.map((member) =>
            toUserView({ ...member.user, role: member.role }),
          );

          const currentUserId = get().currentUser?.id;
          const myMembership = members.find(
            (m) => (m.user?.id || m.userId) === currentUserId,
          );
          set((state) => ({
            workspaceMembers: members,
            users,
            ...(myMembership
              ? {
                  currentUser: {
                    ...state.currentUser,
                    role: myMembership.role,
                  },
                }
              : {}),
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to load users",
          };
        }
      },

      // Tasks
      tasks: [],
      tasksLoading: false,
      tasksError: "",
      taskView: "kanban",
      setTaskView: (v) => set({ taskView: v }),
      loadTasks: async (workspaceId = get().activeWorkspace?.id) => {
        if (!workspaceId) {
          return;
        }

        const members = await workspaceApi.members(workspaceId);

        const users = members.map((member) =>
          toUserView({ ...member.user, role: member.role }),
        );

        set({ tasksLoading: true, tasksError: "", users });

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
            assigneeId: task.assigneeId || undefined,
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
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
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
        if (!workspaceId) {
          return { ok: true };
        }
        try {
          await taskApi.remove(workspaceId, taskId);
          return { ok: true };
        } catch (error) {
          set({ tasks: snapshot });
          return { ok: false, error: error.message || "Unable to delete task" };
        }
      },

      // Goals
      goals: [],
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
      updateGoal: async (
        goalId,
        payload,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) return { ok: false, error: "No active workspace" };
        try {
          const updated = await goalApi.update(workspaceId, goalId, {
            title: payload.title,
            description: payload.description,
            dueDate: payload.dueDate || undefined,
            status: goalStatusToApi[payload.status] || "ACTIVE",
          });
          set((state) => ({
            goals: state.goals.map((g) =>
              g.id === goalId ? toGoalView(updated) : g,
            ),
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error.message || "Unable to update goal" };
        }
      },
      deleteGoal: async (goalId, workspaceId = get().activeWorkspace?.id) => {
        const snapshot = get().goals;
        set((state) => ({ goals: state.goals.filter((g) => g.id !== goalId) }));
        if (!workspaceId) return { ok: true };
        try {
          await goalApi.delete(workspaceId, goalId);
          return { ok: true };
        } catch (error) {
          set({ goals: snapshot });
          return { ok: false, error: error.message || "Unable to delete goal" };
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
      announcements: [],
      announcementsLoading: false,
      announcementMeta: {
        page: 0,
        limit: 0,
        total: 0,
        totalPages: 0,
      },
      loadAnnouncements: async (
        workspaceId = get().activeWorkspace?.id,
        currentUserId = get().currentUser?.id,
        page = 1,
        limit = 10,
        search,
      ) => {
        if (!workspaceId) {
          return;
        }

        set({ announcementsLoading: true });
        try {
          const result = await announcementApi.list(
            workspaceId,
            page,
            limit,
            search,
          );
          set({
            announcements: (result.data || []).map((item) =>
              toAnnouncementView(item, currentUserId),
            ),
            announcementMeta: result?.meta,
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
      updateAnnouncement: async (
        ann,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return {
            ok: false,
            error: "No active workspace selected",
          };
        }

        const previous = get().announcements;

        // =========================
        // OPTIMISTIC UPDATE
        // =========================
        set((state) => ({
          announcements: state.announcements.map((item) =>
            item.id === ann.id
              ? {
                  ...item,
                  ...ann,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        }));

        try {
          const edited = await announcementApi.edit(workspaceId, ann);

          set((state) => ({
            announcements: state.announcements.map((item) =>
              item.id === edited.id ? toAnnouncementView(edited) : item,
            ),
          }));

          return { ok: true };
        } catch (error) {
          // rollback
          set({
            announcements: previous,
          });

          return {
            ok: false,
            error: error.message || "Unable to update announcement",
          };
        }
      },
      deleteAnnouncement: async (
        id,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return {
            ok: false,
            error: "No active workspace selected",
          };
        }

        const previous = get().announcements;

        // =========================
        // OPTIMISTIC DELETE
        // =========================
        set((state) => ({
          announcements: state.announcements.filter((item) => item.id !== id),
        }));

        try {
          await announcementApi.delete(workspaceId, id);

          return { ok: true };
        } catch (error) {
          // rollback
          set({
            announcements: previous,
          });

          return {
            ok: false,
            error: error.message || "Unable to delete announcement",
          };
        }
      },
      announcementComments: {},
      loadAnnouncementComments: async (
        announcementId,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
        try {
          const data = await announcementApi.getComments(
            workspaceId,
            announcementId,
          );
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: Array.isArray(data) ? data : [],
            },
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to load comments",
          };
        }
      },
      commentOnAnnouncement: async (
        announcementId,
        body,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
        const optimisticId = `pending-${Date.now()}`;
        const currentUser = get().currentUser;
        const optimistic = {
          id: optimisticId,
          body,
          authorId: currentUser?.id,
          author: currentUser
            ? { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }
            : null,
          replies: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          announcementComments: {
            ...state.announcementComments,
            [announcementId]: [
              ...(state.announcementComments[announcementId] || []),
              optimistic,
            ],
          },
          announcements: state.announcements.map((ann) =>
            ann.id === announcementId
              ? { ...ann, commentsCount: (ann.commentsCount || 0) + 1 }
              : ann,
          ),
        }));
        try {
          const comment = await announcementApi.comment(
            workspaceId,
            announcementId,
            body,
          );
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: (state.announcementComments[announcementId] || []).map(
                (c) => (c.id === optimisticId ? { ...comment, replies: comment.replies || [] } : c),
              ),
            },
          }));
          return { ok: true, comment };
        } catch (error) {
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: (state.announcementComments[announcementId] || []).filter(
                (c) => c.id !== optimisticId,
              ),
            },
            announcements: state.announcements.map((ann) =>
              ann.id === announcementId
                ? { ...ann, commentsCount: Math.max((ann.commentsCount || 1) - 1, 0) }
                : ann,
            ),
          }));
          return { ok: false, error: error.message || "Unable to add comment" };
        }
      },
      editComment: async (
        announcementId,
        commentId,
        body,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
        const snapshot = get().announcementComments[announcementId];
        const patchBody = (comments) =>
          comments.map((c) => {
            if (c.id === commentId) return { ...c, body };
            if (c.replies?.length) return { ...c, replies: patchBody(c.replies) };
            return c;
          });
        set((state) => ({
          announcementComments: {
            ...state.announcementComments,
            [announcementId]: patchBody(state.announcementComments[announcementId] || []),
          },
        }));
        try {
          await announcementApi.editComment(workspaceId, announcementId, commentId, body);
          return { ok: true };
        } catch (error) {
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: snapshot,
            },
          }));
          return { ok: false, error: error.message || "Unable to edit comment" };
        }
      },
      deleteComment: async (
        announcementId,
        commentId,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
        const snapshot = get().announcementComments[announcementId];
        const removeComment = (comments) =>
          comments
            .filter((c) => c.id !== commentId)
            .map((c) =>
              c.replies?.length
                ? { ...c, replies: removeComment(c.replies) }
                : c,
            );
        set((state) => ({
          announcementComments: {
            ...state.announcementComments,
            [announcementId]: removeComment(state.announcementComments[announcementId] || []),
          },
          announcements: state.announcements.map((ann) =>
            ann.id === announcementId
              ? { ...ann, commentsCount: Math.max((ann.commentsCount || 1) - 1, 0) }
              : ann,
          ),
        }));
        try {
          await announcementApi.deleteComment(workspaceId, announcementId, commentId);
          return { ok: true };
        } catch (error) {
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: snapshot,
            },
          }));
          return { ok: false, error: error.message || "Unable to delete comment" };
        }
      },
      replyToComment: async (
        announcementId,
        commentId,
        body,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return { ok: false, error: "No active workspace" };
        }
        const optimisticId = `pending-reply-${Date.now()}`;
        const currentUser = get().currentUser;
        const optimistic = {
          id: optimisticId,
          body,
          authorId: currentUser?.id,
          author: currentUser
            ? { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }
            : null,
          parentId: commentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          announcementComments: {
            ...state.announcementComments,
            [announcementId]: (state.announcementComments[announcementId] || []).map(
              (c) =>
                c.id === commentId
                  ? { ...c, replies: [...(c.replies || []), optimistic] }
                  : c,
            ),
          },
        }));
        try {
          const reply = await announcementApi.reply(
            workspaceId,
            announcementId,
            commentId,
            body,
          );
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: (state.announcementComments[announcementId] || []).map(
                (c) =>
                  c.id === commentId
                    ? {
                        ...c,
                        replies: (c.replies || []).map((r) =>
                          r.id === optimisticId ? reply : r,
                        ),
                      }
                    : c,
              ),
            },
          }));
          return { ok: true, reply };
        } catch (error) {
          set((state) => ({
            announcementComments: {
              ...state.announcementComments,
              [announcementId]: (state.announcementComments[announcementId] || []).map(
                (c) =>
                  c.id === commentId
                    ? {
                        ...c,
                        replies: (c.replies || []).filter((r) => r.id !== optimisticId),
                      }
                    : c,
              ),
            },
          }));
          return { ok: false, error: error.message || "Unable to add reply" };
        }
      },
      reactToAnnouncement: async (
        announcementId,
        emoji,
        workspaceId = get().activeWorkspace?.id,
      ) => {
        if (!workspaceId) {
          return {
            ok: false,
            error: "No active workspace selected",
          };
        }

        try {
          set((state) => ({
            announcements: state.announcements.map((announcement) => {
              if (announcement.id !== announcementId) {
                return announcement;
              }

              const reactions = {
                ...(announcement.reactions || {}),
              };

              const previousReaction = announcement.myReaction || null;

              // ====================================
              // CASE 1:
              // same reaction clicked again = remove
              // ====================================
              if (previousReaction === emoji) {
                const nextCount = (reactions[emoji] || 1) - 1;

                if (nextCount <= 0) {
                  delete reactions[emoji];
                } else {
                  reactions[emoji] = nextCount;
                }

                return {
                  ...announcement,
                  reactions,
                  myReaction: null,
                  hasReacted: false,
                };
              }

              // ====================================
              // CASE 2:
              // had old reaction, switching emoji
              // ====================================
              if (previousReaction) {
                const oldCount = (reactions[previousReaction] || 1) - 1;

                if (oldCount <= 0) {
                  delete reactions[previousReaction];
                } else {
                  reactions[previousReaction] = oldCount;
                }
              }

              // add new reaction
              reactions[emoji] = (reactions[emoji] || 0) + 1;

              return {
                ...announcement,
                reactions,
                myReaction: emoji,
                hasReacted: true,
              };
            }),
          }));

          await announcementApi.react(workspaceId, announcementId, emoji);

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Unable to react",
          };
        }
      },

      // Dashboard
      dashboardStats: null,
      dashboardLoading: false,
      taskCompletionChart: null,
      loadDashboard: async (
        workspaceId = get().activeWorkspace?.id,
        options = {},
      ) => {
        if (!workspaceId) {
          return;
        }

        set({ dashboardLoading: true });

        try {
          const [dashboard, overview, taskCompletion] = await Promise.all([
            analyticsApi.dashboard(workspaceId, options),
            analyticsApi.overview(workspaceId, options),
            analyticsApi.taskCompletion(workspaceId, options).catch(() => null),
          ]);
          set({
            dashboardStats: { dashboard, overview },
            taskCompletionChart:
              taskCompletion?.data?.months || taskCompletion?.months || null,
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
      notifications: [],
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
