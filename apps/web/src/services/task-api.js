import { apiRequest } from "./api-client";

export const taskApi = {
  board(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/tasks/board`);
  },

  list(workspaceId, query = {}) {
    const params = new URLSearchParams(query);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/workspaces/${workspaceId}/tasks${suffix}`);
  },

  create(workspaceId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/tasks`, {
      method: "POST",
      body: payload,
    });
  },

  get(workspaceId, taskId) {
    return apiRequest(`/workspaces/${workspaceId}/tasks/${taskId}`);
  },

  update(workspaceId, taskId, payload) {
    return apiRequest(`/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(workspaceId, taskId) {
    return apiRequest(`/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  // Legacy method for backwards compatibility
  move(workspaceId, taskId, column) {
    return apiRequest(`/workspaces/${workspaceId}/tasks/${taskId}/move`, {
      method: "PATCH",
      body: { column },
    });
  },
};

