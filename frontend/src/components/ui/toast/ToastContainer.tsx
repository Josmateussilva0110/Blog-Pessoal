import { cn } from "@/lib/format";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";
import type { ToastItem, ToastVariant } from "./types";

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: "border-emerald-400/25 bg-emerald-500/10",
    icon: "text-emerald-300",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-red-400/25 bg-red-500/10",
    icon: "text-red-300",
    Icon: XCircle,
  },
  alert: {
    container: "border-amber-400/25 bg-amber-500/10",
    icon: "text-amber-300",
    Icon: AlertTriangle,
  },
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((toast) => {
        const styles = variantStyles[toast.variant];
        const Icon = styles.Icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "glass-strong rounded-2xl border p-4 shadow-lg shadow-blue-950/30 toast-enter",
              styles.container,
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={cn("h-5 w-5 shrink-0 mt-0.5", styles.icon)}
                aria-hidden
              />

              <p className="flex-1 text-sm text-text leading-relaxed">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-lg p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
