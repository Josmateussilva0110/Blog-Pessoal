import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TerminalWindowBar } from "@/components/ui/TerminalWindow";

type TerminalConfirmModalProps = {
  open: boolean;
  path?: string;
  title: string;
  description: string;
  targetLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TerminalConfirmModal({
  open,
  path = "~/confirm.sh",
  title,
  description,
  targetLabel,
  confirmLabel = "confirm()",
  cancelLabel = "cancel()",
  isLoading = false,
  onConfirm,
  onCancel,
}: TerminalConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Fechar confirmação"
        disabled={isLoading}
        onClick={onCancel}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="terminal-confirm-title"
        aria-describedby="terminal-confirm-description"
        className="relative w-full max-w-md terminal-card overflow-hidden shadow-2xl shadow-black/40"
      >
        <TerminalWindowBar path={path} />

        <div className="p-5 space-y-4 font-mono text-sm">
          <p id="terminal-confirm-title" className="text-xs">
            <span className="text-terminal">$ </span>
            <span className="text-accent">{title}</span>
          </p>

          <div className="space-y-2">
            <p id="terminal-confirm-description" className="text-text-muted leading-relaxed">
              {description}
            </p>
            {targetLabel && (
              <p className="text-text bg-surface-raised border border-border-subtle rounded px-3 py-2 text-xs">
                <span className="text-text-subtle">target: </span>
                {targetLabel}
              </p>
            )}
            <p className="code-comment text-xs">// essa ação não pode ser desfeita</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-mono w-full sm:w-auto"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              className="font-mono w-full sm:w-auto bg-red-500/90 text-white border border-red-400/40 hover:bg-red-500"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "processing..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
