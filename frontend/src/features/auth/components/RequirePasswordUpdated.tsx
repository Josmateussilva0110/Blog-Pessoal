import { Navigate, Outlet } from "react-router-dom";
import { FullPageStatus } from "@/components/ui/FullPageStatus";
import { ROUTES } from "@/config/routes";
import { useAuth } from "../hooks/useAuth";

export function RequirePasswordUpdated() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageStatus message="Verificando sessão…" />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to={ROUTES.adminNewPassword} replace />;
  }

  return <Outlet />;
}
