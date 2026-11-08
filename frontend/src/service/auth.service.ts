import { request } from "./client";
import type {
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  SessionResponse,
  UserProfile,
} from "./types";

export const authService = {
  login(credentials: LoginInput) {
    return request<LoginResponse>("/login", {
      method: "POST",
      body: credentials,
      skipAuthRefresh: true,
    });
  },

  logout() {
    return request<void>("/logout", {
      method: "POST",
      skipAuthRefresh: true,
    });
  },

  refresh() {
    return request<SessionResponse>("/auth/refresh", {
      method: "POST",
      skipAuthRefresh: true,
    });
  },

  changePassword(payload: ChangePasswordInput) {
    return request<UserProfile>("/profile/password", {
      method: "PUT",
      body: payload,
    });
  },

  me(options?: { skipAuthRefresh?: boolean }) {
    return request<UserProfile>("/profile", {
      skipAuthRefresh: options?.skipAuthRefresh,
    });
  },
};
