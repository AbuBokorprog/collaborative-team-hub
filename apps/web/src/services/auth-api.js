import { apiRequest } from "./api-client";
import { setAccessToken } from "./token-store";

function setAuthSession(data) {
  setAccessToken(data?.accessToken);
  return data;
}

export const authApi = {
  async login(payload) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: payload,
      retryOnUnauthorized: false,
    });

    return setAuthSession(data);
  },

  async register(payload) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: payload,
      retryOnUnauthorized: false,
    });

    return setAuthSession(data);
  },

  me() {
    return apiRequest("/auth/me");
  },

  async logout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        retryOnUnauthorized: false,
      });
    } finally {
      setAccessToken(null);
    }
  },
};

