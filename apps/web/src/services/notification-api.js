import { apiRequest } from "./api-client";

export const notificationApi = {
  // Get all notifications for current user
  list(query = {}) {
    const params = new URLSearchParams(query);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/notifications${suffix}`);
  },

  // Get unread count
  unreadCount() {
    return apiRequest("/notifications/unread-count");
  },

  // Get notification preferences
  getPreferences() {
    return apiRequest("/notifications/preferences");
  },

  // Update notification preferences
  updatePreferences(payload) {
    return apiRequest("/notifications/preferences", {
      method: "PATCH",
      body: payload,
    });
  },

  // Mark single notification as read
  markRead(notificationId) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  // Mark all notifications as read
  markAllRead() {
    return apiRequest("/notifications/read-all", {
      method: "PATCH",
    });
  },

  // Delete all read notifications
  deleteRead() {
    return apiRequest("/notifications/delete-read", {
      method: "DELETE",
    });
  },

  // Delete single notification
  delete(notificationId) {
    return apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },
};
