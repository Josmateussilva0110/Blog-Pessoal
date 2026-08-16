import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ToastInput, ToastItem, ToastVariant } from "./types";

const DEFAULT_DURATION = 5000;

type ToastContextValue = {
  success: (input: ToastInput | string) => void;
  error: (input: ToastInput | string) => void;
  alert: (input: ToastInput | string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  toasts: ToastItem[];
  setScopeEnabled: (enabled: boolean) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function normalizeInput(input: ToastInput | string): ToastInput {
  return typeof input === "string" ? { message: input } : input;
}

function createToastId() {
  return crypto.randomUUID();
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const scopeEnabledRef = useRef(false);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const setScopeEnabled = useCallback(
    (enabled: boolean) => {
      scopeEnabledRef.current = enabled;
      if (!enabled) dismissAll();
    },
    [dismissAll],
  );

  const show = useCallback(
    (variant: ToastVariant, input: ToastInput | string) => {
      if (!scopeEnabledRef.current) return;

      const { message, duration = DEFAULT_DURATION } = normalizeInput(input);
      const id = createToastId();

      const toast: ToastItem = { id, variant, message, duration };

      setToasts((current) => [...current, toast]);

      const timer = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (input) => show("success", input),
      error: (input) => show("error", input),
      alert: (input) => show("alert", input),
      dismiss,
      dismissAll,
      toasts,
      setScopeEnabled,
    }),
    [dismiss, dismissAll, show, toasts, setScopeEnabled],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }

  const { success, error, alert, dismiss, dismissAll } = context;

  return { success, error, alert, dismiss, dismissAll };
}

export function useToastScope() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastScope deve ser usado dentro de <ToastProvider>");
  }

  return context;
}
