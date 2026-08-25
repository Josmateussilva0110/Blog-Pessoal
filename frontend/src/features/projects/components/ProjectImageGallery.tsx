import { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { cn } from "@/lib/format";

interface ProjectImageGalleryProps {
  images: string[];
  projectTitle: string;
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ProjectImageGallery({ images, projectTitle }: ProjectImageGalleryProps) {
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

      <div className="terminal-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-raised px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-red-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-terminal/80" />
          <span className="ml-1 truncate font-mono text-[10px] text-text-subtle">
            preview — screenshot-{padIndex(activeIndex)}.png
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="relative block w-full border-b border-border-subtle bg-surface text-left transition-colors hover:bg-surface-raised/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
          aria-label={`Ampliar screenshot ${activeIndex + 1} de ${projectTitle}`}
        >
          <img
            src={activeImage}
            alt={`${projectTitle} — screenshot ${activeIndex + 1}`}
            className="mx-auto block w-full max-h-[220px] cursor-zoom-in object-contain bg-[#06060c] sm:max-h-[300px] md:max-h-[380px]"
          />
        </button>

        <div className="border-b border-border-subtle px-4 py-2 font-mono text-[10px] text-text-subtle">
          image/png · {activeIndex + 1}/{images.length}
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
                <div className="aspect-video bg-surface">
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1} de ${projectTitle}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
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
        />
      )}
    </section>
  );
}
