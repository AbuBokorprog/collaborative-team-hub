import { apiRequest } from "./api-client";

export const userApi = {
  updateProfile(payload) {
    return apiRequest("/users/me", {
      method: "PATCH",
      body: payload,
    });
  },

  uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiRequest("/users/avatar", {
      method: "POST",
      body: formData,
    });
  },
};
