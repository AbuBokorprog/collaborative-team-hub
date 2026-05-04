import { apiRequest, downloadFile } from "./api-client";

const appendFilters = (url, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

export const analyticsApi = {
  dashboard(workspaceId, filters = {}) {
    return apiRequest(appendFilters("/analytics/dashboard", filters), { workspaceId });
  },

  overview(workspaceId, filters = {}) {
    return apiRequest(appendFilters(`/workspaces/${workspaceId}/analytics/overview`, filters));
  },

  activity(workspaceId, filters = {}) {
    return apiRequest(appendFilters(`/workspaces/${workspaceId}/analytics/activity`, filters));
  },

  taskCompletion(workspaceId, filters = {}) {
    return apiRequest(appendFilters(`/workspaces/${workspaceId}/analytics/task-completion`, filters));
  },

  recentActivity(workspaceId, filters = {}) {
    return apiRequest(appendFilters(`/workspaces/${workspaceId}/analytics/recent-activity`, filters));
  },

  members(workspaceId, filters = {}) {
    return apiRequest(appendFilters(`/workspaces/${workspaceId}/analytics/members`, filters));
  },

  exportCsv(workspaceId, filters = {}) {
    const path = appendFilters(`/export/csv`, filters);
    return downloadFile(path, `workspace-${workspaceId}-export.csv`, {
      headers: { "x-workspace-id": workspaceId },
    });
  },

  emailCsv(workspaceId, filters = {}) {
    const filtersWithEmail = { ...filters, sendEmail: "true" };
    return apiRequest(appendFilters(`/export/csv`, filtersWithEmail), {
      headers: { "x-workspace-id": workspaceId },
    });
  },
};

