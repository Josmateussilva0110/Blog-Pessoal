import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FRESH_DETAIL, projectKeys } from "@/features/projects/lib/queryKeys";
import type { AuthUser, ChangePasswordInput, LoginInput } from "@/service";
import { isAdminRoute } from "@/lib/isAdminRoute";
import * as authApi from "../api/auth.api";
import {
  PASSWORD_CHANGE_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "../lib/sessionEvents";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordInput) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  bootstrapAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Abrindo direto uma rota do admin, a sessão ainda vai ser restaurada pelo AuthScope:
  // sem isso o guard redireciona para o login antes e o link direto se perde
  const [isLoading, setIsLoading] = useState(() => isAdminRoute(window.location.pathname));
  const queryClient = useQueryClient();

  // Fim da sessão: dados que só o admin vê não ficam no cache do navegador
  const clearAdminCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: projectKeys.admin() });
    // Detalhes buscados como admin podem trazer dados que a API só entrega logado
    queryClient.removeQueries({
      queryKey: projectKeys.details(),
      predicate: (query) => query.queryKey.includes(FRESH_DETAIL),
    });
  }, [queryClient]);

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

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      clearAdminCache();
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
  }, [refreshUser, clearAdminCache]);

  const login = useCallback(async (credentials: LoginInput) => {
    const { user: loggedUser } = await authApi.login(credentials);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    clearAdminCache();
  }, [clearAdminCache]);

  const changePassword = useCallback(async (payload: ChangePasswordInput) => {
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
    }),
    [
      user,
      isLoading,
      login,
      logout,
      changePassword,
      refreshUser,
      bootstrapAuth,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
