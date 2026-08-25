import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/format";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

type ChartLightboxProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 p-1">
      <button
        type="button"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
        aria-label="Diminuir zoom"
        disabled={zoom <= MIN_ZOOM}
        onClick={onZoomOut}
      >
        <ZoomOut className="size-4" aria-hidden />
      </button>

      <span className="min-w-[3rem] text-center font-mono text-[10px] tabular-nums text-white/70">
        {zoomLabel}
      </span>

      <button
        type="button"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
        aria-label="Aumentar zoom"
        disabled={zoom >= MAX_ZOOM}
        onClick={onZoomIn}
      >
        <ZoomIn className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
        aria-label="Resetar zoom"
        disabled={zoom === 1}
        onClick={onReset}
      >
        <RotateCcw className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function ZoomableViewport({ zoom, active, children }: { zoom: number; active: boolean; children: ReactNode }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!active) {
      setBaseSize({ width: 0, height: 0 });
      return;
    }

    const element = measureRef.current;
    if (!element) return;

    const updateSize = () => {
      setBaseSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [active, children]);

  const hasSize = baseSize.width > 0 && baseSize.height > 0;

  return (
    <div
      className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch]"
    >
      <div
        className="relative mx-auto"
        style={
          hasSize
            ? {
                width: baseSize.width * zoom,
                height: baseSize.height * zoom,
                minWidth: baseSize.width,
              }
            : undefined
        }
      >
        <div
          ref={measureRef}
          className={cn(hasSize ? "absolute left-0 top-0" : "w-full min-w-0 py-1")}
          style={
            hasSize
              ? {
                  width: baseSize.width,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: "transform 150ms ease-out",
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

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
        setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
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
    setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
  }

  function zoomOut() {
    setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
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
