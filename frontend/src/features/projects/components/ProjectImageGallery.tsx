import type { ProjectPlatform } from "@blog/shared";
import { useState } from "react";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { cn } from "@/lib/format";

interface ProjectImageGalleryProps {
  images: string[];
  projectTitle: string;
  platform: ProjectPlatform;
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ProjectImageGallery({
  images,
  projectTitle,
  platform,
}: ProjectImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <section className="space-y-4">
      <div>
        <p className="code-comment mb-2">// gallery</p>
        <p className="font-mono text-xs text-text-subtle">
          <span className="text-terminal">$ </span>
          <span className="text-accent">ls</span>
          <span className="text-text-muted"> ./screenshots</span>
          <span className="text-text-subtle"> · {images.length} files</span>
        </p>
      </div>

      <div className="terminal-card overflow-hidden p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="relative block w-full text-left transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg"
          aria-label={`Ampliar screenshot ${activeIndex + 1} de ${projectTitle}`}
        >
          <DeviceFrame platform={platform}>
            <img
              src={activeImage}
              alt={`${projectTitle} — screenshot ${activeIndex + 1}`}
              className={cn(
                "mx-auto block w-full cursor-zoom-in object-contain bg-[#06060c]",
                platform === "mobile"
                  ? "max-h-[320px] sm:max-h-[420px]"
                  : "max-h-[220px] sm:max-h-[300px] md:max-h-[380px]",
              )}
            />
          </DeviceFrame>
        </button>

        <div className="mt-3 border-t border-border-subtle pt-3 font-mono text-[10px] text-text-subtle">
          screenshot-{padIndex(activeIndex)}.png · {activeIndex + 1}/{images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "terminal-card overflow-hidden text-left transition-colors",
                  isActive
                    ? "border-accent/35 ring-1 ring-accent/20"
                    : "hover:border-accent/20",
                )}
              >
                <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-raised px-2 py-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-terminal/70" />
                  <span className="truncate font-mono text-[9px] text-text-subtle">
                    {padIndex(index)}.png
                  </span>
                </div>
                <div
                  className={cn(
                    "bg-surface p-1.5",
                    platform === "mobile" ? "aspect-[9/16]" : "aspect-video",
                  )}
                >
                  <DeviceFrame platform={platform} compact>
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1} de ${projectTitle}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </DeviceFrame>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          key={lightboxIndex}
          images={images}
          initialIndex={lightboxIndex}
          open
          onClose={() => setLightboxIndex(null)}
          altPrefix={projectTitle}
          platform={platform}
        />
      )}
    </section>
  );
}
