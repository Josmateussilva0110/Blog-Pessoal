import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isAdminRoute } from "@/lib/isAdminRoute";
import { useAuth } from "../hooks/useAuth";

export function AuthScope() {
  const location = useLocation();
  const { bootstrapAuth, clearAuthSession } = useAuth();
  const wasAdminRef = useRef(false);

  useEffect(() => {
    const isAdmin = isAdminRoute(location.pathname);

    if (isAdmin) {
      if (!wasAdminRef.current) {
        void bootstrapAuth();
      }
      wasAdminRef.current = true;
      return;
    }

    wasAdminRef.current = false;
    clearAuthSession();
  }, [location.pathname, bootstrapAuth, clearAuthSession]);

  return null;
}
