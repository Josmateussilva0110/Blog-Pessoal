import { authService } from "@/service";
import type { AuthUser, LoginCredentials } from "@/service";

export async function login(credentials: LoginCredentials) {
  const result = await authService.login(credentials);

  if (!result.success) {
    throw new Error(result.message);
  }

  localStorage.setItem("accessToken", result.data.accessToken);
  return result.data;
}

export async function logout() {
  const result = await authService.logout();
  localStorage.removeItem("accessToken");

  if (!result.success) {
    throw new Error(result.message);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const result = await authService.me();

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function refreshSession() {
  const result = await authService.refresh();

  if (!result.success) {
    throw new Error(result.message);
  }

  localStorage.setItem("accessToken", result.data.accessToken);
  return result.data.accessToken;
}
