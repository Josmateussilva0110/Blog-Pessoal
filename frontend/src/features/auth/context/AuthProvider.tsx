import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, ChangePasswordPayload, LoginCredentials } from "@/service";
import * as authApi from "../api/auth.api";
import {
  PASSWORD_CHANGE_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "../lib/sessionEvents";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  bootstrapAuth: () => Promise<void>;
  clearAuthSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const bootstrapAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentUser = await authApi.restoreSession();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAuthSession = useCallback(() => {
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }

    function handlePasswordChangeRequired() {
      void refreshUser();
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(
      PASSWORD_CHANGE_REQUIRED_EVENT,
      handlePasswordChangeRequired,
    );

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener(
        PASSWORD_CHANGE_REQUIRED_EVENT,
        handlePasswordChangeRequired,
      );
    };
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user: loggedUser } = await authApi.login(credentials);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    const updatedUser = await authApi.changePassword(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      changePassword,
      refreshUser,
      bootstrapAuth,
      clearAuthSession,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      changePassword,
      refreshUser,
      bootstrapAuth,
      clearAuthSession,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
