import { Navigate, Outlet } from "react-router-dom";
import { FullPageStatus } from "@/components/ui/FullPageStatus";
import { ROUTES } from "@/config/routes";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullPageStatus message="Carregando…" />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.mustChangePassword ? ROUTES.adminNewPassword : ROUTES.admin}
        replace
      />
    );
  }

  return <Outlet />;
}
