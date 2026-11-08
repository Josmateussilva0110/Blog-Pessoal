import type { UserProfile } from "@blog/shared";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// Tipos de entrada e do perfil vêm do shared (os mesmos que o backend valida)
export type { ChangePasswordInput, LoginInput, UserProfile } from "@blog/shared";

/** Usuário logado no formato do frontend (camelCase), montado a partir do UserProfile da API */
export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  mustChangePassword: boolean;
  hasProfileImage: boolean;
  profileImageUpdatedAt: string | null;
  profileImagePublicUrl: string | null;
};

export type LoginResponse = {
  user: UserProfile | null;
};

export type SessionResponse = {
  user: UserProfile | null;
};
