import { apiRequest } from "./api-client";

export const analyticsApi = {
  dashboard(workspaceId) {
    return apiRequest("/analytics/dashboard", { workspaceId });
  },

  overview(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/analytics/overview`);
  },

  activity(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/analytics/activity`);
  },
};

