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

  // A API responde só a confirmação: o perfil atualizado vem de uma nova leitura,
  // com refresh de sessão liberado (a senha já mudou, não pode falhar por token vencido)
  const profile = await authService.me();
  const user = profile.success ? mapAuthUser(profile.data) : null;
  if (!user) {
    throw new Error("Senha atualizada, mas não foi possível carregar o perfil.");
  }

  return user;
}
