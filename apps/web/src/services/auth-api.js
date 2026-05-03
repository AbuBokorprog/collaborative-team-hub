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

  forgotPassword(email) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
      retryOnUnauthorized: false,
    });
  },

  resetPassword({ token, newPassword }) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
      retryOnUnauthorized: false,
    });
  },

  verifyEmail(token) {
    return apiRequest("/auth/verify-email", {
      method: "POST",
      body: { token },
      retryOnUnauthorized: false,
    });
  },

  changePassword(payload) {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: payload,
    });
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
