import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  clampZoom,
  ZOOM_STEP,
  ZoomableViewport,
  ZoomControls,
} from "@/components/ui/ZoomableViewport";

type ChartLightboxProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function ChartLightbox({ open, title, onClose, children }: ChartLightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open) {
      setZoom(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  function zoomIn() {
    setZoom((current) => clampZoom(current + ZOOM_STEP));
  }

  function zoomOut() {
    setZoom((current) => clampZoom(current - ZOOM_STEP));
  }

  function resetZoom() {
    setZoom(1);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/80"
        aria-label="Fechar gráfico"
        onClick={onClose}
      />

      <button
        type="button"
        className="absolute right-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 sm:right-5 sm:top-5 sm:size-10"
        aria-label="Fechar"
        onClick={onClose}
      >
        <X className="size-4 sm:size-5" aria-hidden />
      </button>

      <div
        className="relative z-10 flex max-h-[min(92dvh,56rem)] w-full max-w-6xl flex-col gap-3 overflow-hidden rounded-xl border border-white/15 bg-[#101018] p-3 shadow-2xl sm:gap-4 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="font-mono text-xs text-white/80 sm:text-sm">{title}</p>
          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
          />
        </div>

        <ZoomableViewport zoom={zoom} active={open}>
          {children}
        </ZoomableViewport>
      </div>
    </div>,
    document.body,
  );
}
