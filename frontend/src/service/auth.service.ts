import { request } from "./client";
import type { AuthUser, LoginCredentials, LoginResponse } from "./types";

const BASE = "/auth";

export const authService = {
  login(credentials: LoginCredentials) {
    return request<LoginResponse>(`${BASE}/login`, {
      method: "POST",
      body: credentials,
    });
  },

  logout() {
    return request<void>(`${BASE}/logout`, { method: "POST" });
  },

  refresh() {
    return request<{ accessToken: string }>(`${BASE}/refresh`, {
      method: "POST",
    });
  },

  me() {
    return request<AuthUser>(`${BASE}/me`);
  },
};
