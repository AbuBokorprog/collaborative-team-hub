import { getAccessToken, setAccessToken } from "./token-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed", {
      status: response.status,
      payload,
    });
  }

  return payload?.data ?? payload;
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const data = await parseResponse(response);
  setAccessToken(data?.accessToken);
  return data?.accessToken;
}

export async function apiRequest(path, options = {}) {
  const {
    body,
    headers,
    workspaceId,
    retryOnUnauthorized = true,
    ...init
  } = options;

  const token = getAccessToken();
  const requestHeaders = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(workspaceId ? { "x-workspace-id": workspaceId } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const nextToken = await refreshAccessToken();

    if (nextToken) {
      return apiRequest(path, {
        body,
        headers,
        workspaceId,
        retryOnUnauthorized: false,
        ...init,
      });
    }
  }

  return parseResponse(response);
}

export { ApiError, API_URL };

