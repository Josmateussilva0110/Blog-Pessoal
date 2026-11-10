import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

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
  // Foco inicial no Cancelar: um Enter sem querer não dispara a ação destrutiva
  const cancelRef = useRef<HTMLButtonElement>(null);
  const containerRef = useFocusTrap<HTMLDivElement>(open, cancelRef);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
    >
      {/* Fundo só para o mouse/toque; pelo teclado o Esc e o Cancelar fazem o mesmo */}
      <button
        type="button"
        tabIndex={-1}
        className="fixed inset-0 bg-scrim/70 backdrop-blur-[2px]"
        aria-label="Fechar confirmação"
        disabled={isLoading}
        onClick={onCancel}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-3xl border border-home-line bg-home-card p-6 shadow-2xl shadow-scrim/50"
      >
        <h2 id={titleId} className="text-lg font-semibold tracking-heading text-home-ink">
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
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="w-full sm:w-auto"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
