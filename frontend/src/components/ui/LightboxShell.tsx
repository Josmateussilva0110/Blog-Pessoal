import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  clampZoom,
  ZOOM_STEP,
  ZoomableViewport,
  ZoomControls,
} from "@/components/ui/ZoomableViewport";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

/** Botões redondos sobre a mídia (fechar, anterior, próxima) */
export const LIGHTBOX_ICON_BUTTON_CLASS =
  "inline-flex size-9 items-center justify-center rounded-full bg-scrim/60 text-on-scrim transition-colors hover:bg-scrim/80 focus-visible:outline-2 focus-visible:outline-brand sm:size-10";

type LightboxShellProps = {
  /** Nome do diálogo para leitores de tela */
  label: string;
  /** Rótulo do fundo clicável que fecha */
  backdropLabel: string;
  onClose: () => void;
  /** Texto à esquerda dos controles de zoom (título, contador) */
  caption?: ReactNode;
  /** Muda quando o conteúdo troca (outra imagem): volta o zoom para 100% */
  resetKey?: unknown;
  /** Teclas extras além de Esc e zoom (+, -, 0) */
  onKeyDown?: (event: KeyboardEvent) => void;
  /** Controles posicionados sobre o fundo (setas de navegação) */
  overlay?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Visualização ampliada com zoom: base comum dos lightboxes de imagem e de gráfico */
export function LightboxShell({
  label,
  backdropLabel,
  onClose,
  caption,
  resetKey,
  onKeyDown,
  overlay,
  className,
  children,
}: LightboxShellProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useFocusTrap<HTMLDivElement>(true);
  useBodyScrollLock(true);

  useEffect(() => {
    setZoom(1);
  }, [resetKey]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((current) => clampZoom(current + ZOOM_STEP));
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        setZoom((current) => clampZoom(current - ZOOM_STEP));
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        setZoom(1);
        return;
      }

      onKeyDown?.(event);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onKeyDown]);

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 outline-none sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Fundo só para o mouse/toque; pelo teclado fecha com Esc ou com o botão Fechar */}
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 z-0 bg-scrim/80"
        aria-label={backdropLabel}
        onClick={onClose}
      />

      <button
        type="button"
        className={cn(LIGHTBOX_ICON_BUTTON_CLASS, "absolute right-3 top-3 z-20 sm:right-5 sm:top-5")}
        aria-label="Fechar"
        onClick={onClose}
      >
        <X className="size-4 sm:size-5" aria-hidden />
      </button>

      {overlay}

      <div
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,56rem)] w-full flex-col overflow-hidden rounded-xl border border-home-line bg-home-card p-3 shadow-2xl",
          className,
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          {caption ?? <span />}
          <ZoomControls
            zoom={zoom}
            onZoomIn={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
            onZoomOut={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
            onReset={() => setZoom(1)}
          />
        </div>

        <ZoomableViewport zoom={zoom} active>
          {children}
        </ZoomableViewport>
      </div>
    </div>,
    document.body,
  );
}
