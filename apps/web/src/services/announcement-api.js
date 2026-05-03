import { apiRequest } from "./api-client";

export const announcementApi = {
  list(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/announcements`);
  },

  create(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/announcements`, {
      method: "POST",
      body: payload,
    });
  },

  react(workspaceId, announcementId, emoji) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
      {
        method: "POST",
        body: { emoji },
      },
    );
  },

  pin(workspaceId, announcementId) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${announcementId}/pin`,
      { method: "PATCH" },
    );
  },

  getComments(workspaceId, announcementId) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
    );
  },

  comment(workspaceId, announcementId, body) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
      {
        method: "POST",
        body: { body },
      },
    );
  },
};

