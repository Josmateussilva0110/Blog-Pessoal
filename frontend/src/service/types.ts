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

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  mustChangePassword: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: UserProfile | null;
};

export type SessionResponse = {
  user: UserProfile | null;
};

export type ChangePasswordPayload = {
  new_password: string;
  confirm_password: string;
  current_password?: string;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  must_change_password: boolean;
};
