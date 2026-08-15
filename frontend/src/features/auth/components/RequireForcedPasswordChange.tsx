import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequireForcedPasswordChange() {
  const { user, isLoading, refreshUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let active = true;

    refreshUser().finally(() => {
      if (active) setIsVerifying(false);
    });

    return () => {
      active = false;
    };
  }, [refreshUser]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-sm text-text-muted animate-pulse">
          Carregando...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
