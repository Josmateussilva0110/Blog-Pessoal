import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectPlatform } from "@blog/shared";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import {
  clampZoom,
  ZOOM_STEP,
  ZoomableViewport,
  ZoomControls,
} from "@/components/ui/ZoomableViewport";
import { cn } from "@/lib/format";

type ImageLightboxProps = {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  altPrefix: string;
  platform?: ProjectPlatform;
};

export function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
  altPrefix,
  platform,
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
      setZoom(1);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (open) {
      setZoom(1);
    }
  }, [open, activeIndex]);

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
        return;
      }

      if (images.length <= 1) return;

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, images.length]);

  if (!open) return null;

  const activeImage = images[activeIndex];
  if (!activeImage) return null;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  function zoomIn() {
    setZoom((current) => clampZoom(current + ZOOM_STEP));
  }

  function zoomOut() {
    setZoom((current) => clampZoom(current - ZOOM_STEP));
  }

  function resetZoom() {
    setZoom(1);
  }

  const imageContent = platform ? (
    <DeviceFrame platform={platform}>
      <img
        src={activeImage}
        alt={`${altPrefix} — imagem ${activeIndex + 1}`}
        className={cn(
          "mx-auto block w-full object-contain",
          platform === "mobile"
            ? "max-h-[65dvh] sm:max-h-[70vh]"
            : "max-h-[55dvh] sm:max-h-[60vh]",
        )}
      />
    </DeviceFrame>
  ) : (
    <img
      src={activeImage}
      alt={`${altPrefix} — imagem ${activeIndex + 1}`}
      className="mx-auto block h-auto max-h-[55dvh] w-auto max-w-full object-contain sm:max-h-[60vh]"
    />
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da imagem"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/80"
        aria-label="Fechar visualização"
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

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 sm:left-4 sm:size-10"
            aria-label="Imagem anterior"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
          >
            <ChevronLeft className="size-5 sm:size-6" aria-hidden />
          </button>

          <button
            type="button"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 sm:right-4 sm:size-10"
            aria-label="Próxima imagem"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
          >
            <ChevronRight className="size-5 sm:size-6" aria-hidden />
          </button>
        </>
      )}

      <div
        className="relative z-10 flex max-h-[min(92dvh,56rem)] w-full max-w-4xl flex-col gap-2 overflow-hidden rounded-xl border border-white/15 bg-[#101018] p-3 shadow-2xl sm:gap-3 sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          {images.length > 1 ? (
            <p className="font-mono text-[10px] text-white/70 sm:text-xs">
              {activeIndex + 1} / {images.length}
            </p>
          ) : (
            <span />
          )}
          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
          />
        </div>

        <ZoomableViewport zoom={zoom} active={open}>
          {imageContent}
        </ZoomableViewport>
      </div>
    </div>,
    document.body,
  );
}
