import { apiRequest } from "./api-client";

export const goalApi = {
  list(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/goals`);
  },

  get(workspaceId, goalId) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}`);
  },

  create(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/goals`, {
      method: "POST",
      body: payload,
    });
  },

  update(workspaceId, goalId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  // Get goal analytics with task breakdown
  analytics(workspaceId, goalId) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}/analytics`);
  },

  delete(workspaceId, goalId) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}`, {
      method: "DELETE",
    });
  },

  // Legacy method for backwards compatibility
  progress(workspaceId, goalId, progress) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}/progress`, {
      method: "PATCH",
      body: { progress },
    });
  },
};

