import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-sm text-text-muted animate-pulse">
          Carregando...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.mustChangePassword ? "/admin/new-password" : "/admin"}
        replace
      />
    );
  }

  return <Outlet />;
}
