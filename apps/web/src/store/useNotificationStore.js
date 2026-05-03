"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notificationApi } from "@/services/notification-api";
import socketClient from "@/services/socket-client";

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      loading: false,
      preferences: {
        emailMentions: true,
        emailTaskAssignments: true,
        emailGoalUpdates: false,
        emailWeeklyDigest: true,
        pushMentions: true,
        pushDueDateReminders: false,
        pushAnnouncements: true,
        desktopSound: false,
      },
      onlineUsers: [],

      // Actions
      loadNotifications: async () => {
        set({ loading: true });
        try {
          const data = await notificationApi.list();

          const notifications = data.data || [];
          const unreadCount = notifications.filter((n) => !n.read).length;

          set({
            notifications,
            unreadCount,
            loading: false,
          });
          return { ok: true };
        } catch (error) {
          set({ loading: false });
          return {
            ok: false,
            error: error.message || "Failed to load notifications",
          };
        }
      },

      loadUnreadCount: async () => {
        try {
          const data = await notificationApi.unreadCount();
          set({ unreadCount: data.unread || 0 });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to load unread count",
          };
        }
      },

      markAsRead: async (notificationId) => {
        try {
          // Update local state immediately for better UX
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));

          // Call API
          await notificationApi.markRead(notificationId);

          // Emit socket event for other tabs
          socketClient.markNotificationRead(notificationId);

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to mark as read",
          };
        }
      },

      markAllAsRead: async () => {
        try {
          // Update local state immediately
          set({
            notifications: get().notifications.map((n) => ({
              ...n,
              read: true,
            })),
            unreadCount: 0,
          });

          // Call API
          await notificationApi.markAllRead();

          // Emit socket event for other tabs
          socketClient.markAllNotificationsRead();

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to mark all as read",
          };
        }
      },

      deleteNotification: async (notificationId) => {
        try {
          // Update local state immediately
          const notification = get().notifications.find(
            (n) => n.id === notificationId,
          );
          set((state) => ({
            notifications: state.notifications.filter(
              (n) => n.id !== notificationId,
            ),
            unreadCount:
              notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          }));

          // Call API
          await notificationApi.delete(notificationId);

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to delete notification",
          };
        }
      },

      deleteReadNotifications: async () => {
        try {
          // Update local state immediately
          set({
            notifications: get().notifications.filter((n) => !n.read),
            unreadCount: 0,
          });

          // Call API
          await notificationApi.deleteRead();

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to delete read notifications",
          };
        }
      },

      loadPreferences: async () => {
        try {
          const preferences = await notificationApi.getPreferences();
          set({ preferences });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to load preferences",
          };
        }
      },

      updatePreferences: async (newPreferences) => {
        try {
          const updated =
            await notificationApi.updatePreferences(newPreferences);
          set({ preferences: updated });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error.message || "Failed to update preferences",
          };
        }
      },

      // Socket event handlers
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        }));
      },

      updateNotificationRead: ({ notificationId }) => {
        set((state) => {
          const notification = state.notifications.find(
            (n) => n.id === notificationId,
          );
          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
            unreadCount:
              notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          };
        });
      },

      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        });
      },

      updateOnlineUsers: ({ userIds }) => {
        set({ onlineUsers: userIds });
      },

      // Initialize socket listeners
      initializeSocket: () => {
        socketClient.on("notifications:new", (notification) => {
          get().addNotification(notification);
        });

        socketClient.on("notification:read", (data) => {
          get().updateNotificationRead(data);
        });

        socketClient.on("notifications:all-read", () => {
          get().markAllNotificationsRead();
        });

        socketClient.on("online-users", (data) => {
          get().updateOnlineUsers(data);
        });

        // Connect socket
        socketClient.connect();
      },
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
      }),
    },
  ),
);
