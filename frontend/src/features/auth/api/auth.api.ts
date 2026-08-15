import { authService } from "@/service";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
} from "@/service";
import { mapAuthUser } from "../lib/mapAuthUser";

export async function login(credentials: LoginCredentials) {
  const result = await authService.login(credentials);

  if (!result.success) {
    throw new Error(result.message);
  }

  const user = mapAuthUser(result.data.user);
  if (!user) {
    throw new Error("Não foi possível carregar o perfil após o login.");
  }

  return { user };
}

export async function logout() {
  const result = await authService.logout();

  if (!result.success) {
    throw new Error(result.message);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const result = await authService.me();

  if (!result.success) {
    return null;
  }

  return mapAuthUser(result.data);
}

export async function changePassword(payload: ChangePasswordPayload) {
  const result = await authService.changePassword(payload);

  if (!result.success) {
    throw new Error(result.message);
  }

  const user = mapAuthUser(result.data);
  if (!user) {
    throw new Error("Senha atualizada, mas não foi possível carregar o perfil.");
  }

  return user;
}
