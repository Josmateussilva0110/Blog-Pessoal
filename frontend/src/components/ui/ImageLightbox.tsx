import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ImageLightboxProps = {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  altPrefix: string;
};

export function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
  altPrefix,
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
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

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-2 rounded-xl border border-white/15 bg-[#101018] p-3 shadow-2xl sm:gap-3 sm:p-4">
        <img
          src={activeImage}
          alt={`${altPrefix} — imagem ${activeIndex + 1}`}
          className="h-auto max-h-[55dvh] w-auto max-w-full object-contain sm:max-h-[60vh]"
        />

        {images.length > 1 && (
          <p className="font-mono text-[10px] text-white/70 sm:text-xs">
            {activeIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
