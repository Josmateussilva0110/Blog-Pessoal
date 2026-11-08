import { authService } from "@/service";
import type {
  AuthUser,
  ChangePasswordInput,
  LoginInput,
} from "@/service";
import { mapAuthUser } from "../lib/mapAuthUser";
import { restoreSession as restoreAuthSession } from "../lib/restoreSession";

export async function login(credentials: LoginInput) {
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
  const result = await authService.me({ skipAuthRefresh: true });

  if (!result.success) {
    return null;
  }

  return mapAuthUser(result.data);
}

export async function restoreSession(): Promise<AuthUser | null> {
  return restoreAuthSession();
}

export async function changePassword(payload: ChangePasswordInput) {
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
