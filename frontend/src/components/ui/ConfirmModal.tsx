import { useEffect, useId } from "react";
import { Button } from "@/components/ui/Button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  targetLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Texto do botão enquanto a ação roda */
  loadingLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmação de ação destrutiva (remover projeto, atualização) */
export function ConfirmModal({
  open,
  title,
  description,
  targetLabel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loadingLabel = "Processando…",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
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
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-3xl border border-home-line bg-home-card p-6 shadow-2xl shadow-black/50"
      >
        <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em] text-home-ink">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-home-muted">
          {description}
        </p>
        {targetLabel && (
          <p className="mt-4 rounded-xl bg-home-inset px-3.5 py-2.5 text-sm font-medium text-home-ink">
            {targetLabel}
          </p>
        )}
        <p className="mt-3 text-xs text-home-muted">Essa ação não pode ser desfeita.</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
