import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PASSWORD_CHANGE_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "@/features/auth/lib/sessionEvents";
import { isAdminRoute } from "@/lib/isAdminRoute";
import { ToastContainer } from "./ToastContainer";
import { useToast, useToastScope } from "./ToastProvider";

function ToastListeners({ enabled }: { enabled: boolean }) {
  const toast = useToast();

  useEffect(() => {
    if (!enabled) return;

    function handleSessionExpired() {
      toast.error("Sessão expirada. Faça login novamente.");
    }

    function handlePasswordChangeRequired() {
      toast.alert("Defina uma nova senha para continuar.");
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
  }, [enabled, toast]);

  return null;
}

export function ToastScope() {
  const location = useLocation();
  const { toasts, dismiss, setScopeEnabled } = useToastScope();
  const enabled = isAdminRoute(location.pathname);

  useEffect(() => {
    setScopeEnabled(enabled);
  }, [enabled, setScopeEnabled]);

  return (
    <>
      <ToastListeners enabled={enabled} />
      {enabled && <ToastContainer toasts={toasts} onDismiss={dismiss} />}
    </>
  );
}
