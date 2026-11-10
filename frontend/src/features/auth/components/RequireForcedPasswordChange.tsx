import { Navigate, Outlet } from "react-router-dom";
import { FullPageStatus } from "@/components/ui/FullPageStatus";
import { ROUTES } from "@/config/routes";
import { useAuth } from "../hooks/useAuth";

export function RequireForcedPasswordChange() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageStatus message="Carregando…" />;
  }

  if (!user) {
    return <Navigate to={ROUTES.adminLogin} replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to={ROUTES.admin} replace />;
  }

  return <Outlet />;
}
