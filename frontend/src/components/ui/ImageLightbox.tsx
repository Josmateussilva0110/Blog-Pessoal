import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectPlatform } from "@blog/shared";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { LIGHTBOX_ICON_BUTTON_CLASS, LightboxShell } from "@/components/ui/LightboxShell";
import { cn } from "@/lib/cn";

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
  const hasMany = images.length > 1;

  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!hasMany) return;
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    },
    [hasMany, showPrevious, showNext],
  );

  if (!open) return null;

  const activeImage = images[activeIndex];
  if (!activeImage) return null;

  const alt = `${altPrefix} — imagem ${activeIndex + 1}`;

  const imageContent = platform ? (
    <DeviceFrame platform={platform}>
      <img
        src={activeImage}
        alt={alt}
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
      alt={alt}
      className="mx-auto block h-auto max-h-[55dvh] w-auto max-w-full object-contain sm:max-h-[60vh]"
    />
  );

  return (
    <LightboxShell
      label="Visualização ampliada da imagem"
      backdropLabel="Fechar visualização"
      onClose={onClose}
      resetKey={activeIndex}
      onKeyDown={handleKeyDown}
      className="max-w-4xl gap-2 sm:gap-3 sm:p-4"
      caption={
        hasMany ? (
          <p className="font-mono text-3xs text-home-muted sm:text-xs" aria-live="polite">
            {activeIndex + 1} / {images.length}
          </p>
        ) : undefined
      }
      overlay={
        hasMany && (
          <>
            <button
              type="button"
              className={cn(LIGHTBOX_ICON_BUTTON_CLASS, "absolute left-2 top-1/2 z-20 -translate-y-1/2 sm:left-4")}
              aria-label="Imagem anterior"
              onClick={showPrevious}
            >
              <ChevronLeft className="size-5 sm:size-6" aria-hidden />
            </button>
            <button
              type="button"
              className={cn(LIGHTBOX_ICON_BUTTON_CLASS, "absolute right-2 top-1/2 z-20 -translate-y-1/2 sm:right-4")}
              aria-label="Próxima imagem"
              onClick={showNext}
            >
              <ChevronRight className="size-5 sm:size-6" aria-hidden />
            </button>
          </>
        )
      }
    >
      {imageContent}
    </LightboxShell>
  );
}
