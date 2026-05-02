import { apiRequest } from "./api-client";

export const workspaceApi = {
  list() {
    return apiRequest("/workspaces");
  },

  create(payload) {
    return apiRequest("/workspaces", {
      method: "POST",
      body: payload,
    });
  },

  update(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  get(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}`);
  },

  members(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/members`);
  },

  stats(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/stats`);
  },

  invite(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/invite`, {
      method: "POST",
      body: payload,
    });
  },
};
