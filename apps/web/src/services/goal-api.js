import { apiRequest } from "./api-client";

export const goalApi = {
  list(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/goals`);
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

  progress(workspaceId, goalId, progress) {
    return apiRequest(`/workspaces/${workspaceId}/goals/${goalId}/progress`, {
      method: "PATCH",
      body: { progress },
    });
  },
};

