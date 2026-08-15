import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequirePasswordUpdated() {
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
          Verificando sessão...
        </span>
      </div>
    );
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/admin/new-password" replace />;
  }

  return <Outlet />;
}
