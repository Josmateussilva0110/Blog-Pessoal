import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/format";

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.25;

export function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function ZoomControls({
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

export function ZoomableViewport({
  zoom,
  active,
  children,
}: {
  zoom: number;
  active: boolean;
  children: ReactNode;
}) {
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
