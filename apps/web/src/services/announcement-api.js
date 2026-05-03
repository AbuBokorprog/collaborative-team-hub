import { apiRequest } from "./api-client";

export const announcementApi = {
  list(workspaceId, page, limit, search) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);

    const query = params.toString();

    return apiRequest(
      `/workspaces/${workspaceId}/announcements${query ? `?${query}` : ""}`,
    );
  },

  create(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/announcements`, {
      method: "POST",
      body: payload,
    });
  },

  edit(workspaceId, payload) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${payload.id}`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  delete(workspaceId, announcementsId) {
    return apiRequest(
      `/workspaces/${workspaceId}/announcements/${announcementsId}`,
      {
        method: "DELETE",
      },
    );
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
