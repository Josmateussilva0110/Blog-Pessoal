import { useState } from "react";
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
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-raised">
          <span className="h-2 w-2 rounded-full bg-red-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-terminal/80" />
          <span className="font-mono text-[10px] ml-1 truncate text-text-subtle">
            preview — screenshot-{padIndex(activeIndex)}.png
          </span>
        </div>

        <div className="relative bg-surface border-b border-border-subtle">
          <img
            src={activeImage}
            alt={`${projectTitle} — screenshot ${activeIndex + 1}`}
            className="w-full max-h-[420px] object-contain bg-[#06060c]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(34_211_238/0.025)_50%)] bg-[length:100%_3px]"
            aria-hidden
          />
        </div>

        <div className="px-4 py-2 font-mono text-[10px] text-text-subtle border-b border-border-subtle">
          image/png · {activeIndex + 1}/{images.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
              <div className="flex items-center gap-1.5 px-2 py-1 border-b border-border-subtle bg-surface-raised">
                <span className="h-1.5 w-1.5 rounded-full bg-terminal/70 shrink-0" />
                <span className="font-mono text-[9px] text-text-subtle truncate">
                  {padIndex(index)}.png
                </span>
              </div>
              <div className="relative aspect-video bg-surface">
                <img
                  src={image}
                  alt={`Miniatura ${index + 1} de ${projectTitle}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(34_211_238/0.03)_50%)] bg-[length:100%_2px]"
                  aria-hidden
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
