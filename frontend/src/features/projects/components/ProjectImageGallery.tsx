import type { ProjectPlatform } from "@blog/shared";
import { Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/Image";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { cn } from "@/lib/format";
import { getThumbnailUrl } from "@/lib/imageUrl";

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

  const lightbox = lightboxIndex !== null && (
    <ImageLightbox
      key={lightboxIndex}
      images={images}
      initialIndex={lightboxIndex}
      open
      onClose={() => setLightboxIndex(null)}
      altPrefix={projectTitle}
      platform={platform}
    />
  );

  if (platform === "mobile") {
    return (
      <>
        <PhoneGallery
          images={images}
          projectTitle={projectTitle}
          onOpen={setLightboxIndex}
        />
        {lightbox}
      </>
    );
  }

  return (
    <section className="space-y-3" aria-label="Galeria de imagens">
      <div className="project-card relative overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="group relative block w-full cursor-zoom-in bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
          aria-label={`Ampliar imagem ${activeIndex + 1} de ${projectTitle}`}
        >
          {/* Proporção fixa reserva a altura antes do download: sem layout shift */}
          <img
            src={activeImage}
            alt={`${projectTitle} — imagem ${activeIndex + 1}`}
            decoding="async"
            className={cn(
              "mx-auto block aspect-[16/10] w-full object-contain",
              "max-h-[320px] sm:max-h-[460px] md:max-h-[600px] xl:max-h-[680px]",
            )}
          />
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-black/60 px-2.5 py-1 font-mono text-[11px] text-text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="size-3" aria-hidden />
            ampliar
          </span>
        </button>

        {images.length > 1 && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-hairline-strong bg-black/60 px-2.5 py-1 font-mono text-[11px] text-text-muted">
            {padIndex(activeIndex)} / {padIndex(images.length - 1)}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Mostrar imagem ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "shrink-0 overflow-hidden rounded-lg border bg-surface-inset transition-all",
                  "aspect-video w-28 sm:w-36",
                  isActive
                    ? "border-accent/60 ring-2 ring-accent/20"
                    : "border-hairline opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={getThumbnailUrl(image)}
                  fallback={image}
                  alt=""
                  rounded="none"
                  className="h-full w-full object-top"
                />
              </button>
            );
          })}
        </div>
      )}

      {lightbox}
    </section>
  );
}

/**
 * Prints de celular são estreitos: todos lado a lado como aparelhos, em vez de
 * um por vez num bloco largo cheio de espaço vazio. No celular vira um
 * carrossel de ponta a ponta com o aparelho da vez centralizado.
 */
function PhoneGallery({
  images,
  projectTitle,
  onOpen,
}: {
  images: string[];
  projectTitle: string;
  onOpen: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () => setOverflowing(scroller.scrollWidth > scroller.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  /** Aparelho mais próximo do centro do carrossel */
  function updateCurrent() {
    frameRef.current = 0;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    const items = Array.from(scroller.querySelectorAll<HTMLElement>("[data-phone]"));
    let closest = 0;
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const best = items[closest].offsetLeft + items[closest].offsetWidth / 2;
      if (Math.abs(itemCenter - center) < Math.abs(best - center)) closest = index;
    });
    setCurrent(closest);
  }

  // No máximo uma medição por frame, por mais eventos de scroll que cheguem
  function handleScroll() {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(updateCurrent);
  }

  function scrollToPhone(index: number) {
    scrollerRef.current
      ?.querySelectorAll<HTMLElement>("[data-phone]")
      [index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <section
      className="project-card project-cover-mobile -mx-4 overflow-hidden border-x-0 sm:mx-0 sm:rounded-2xl sm:border-x"
      aria-label="Galeria de imagens"
    >
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="snap-x snap-mandatory overflow-x-auto py-8 [scrollbar-width:none] sm:py-10 [&::-webkit-scrollbar]:hidden"
      >
        {/* Padding lateral de meia tela menos meio aparelho: qualquer um pode centralizar */}
        <ul className="mx-auto flex w-max gap-4 px-[19vw] sm:gap-6 sm:px-8">
          {images.map((image, index) => (
            <li key={image} data-phone className="snap-center">
              <button
                type="button"
                onClick={() => onOpen(index)}
                className="block w-[62vw] max-w-[240px] cursor-zoom-in overflow-hidden rounded-[1.6rem] border-[3px] border-hairline-strong bg-black shadow-2xl shadow-black/60 transition-transform duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-[210px] lg:w-[230px]"
                aria-label={`Ampliar imagem ${index + 1} de ${projectTitle}`}
              >
                {/* Aparelho tem no máximo 240px: a miniatura basta; o original fica para o lightbox */}
                <Image
                  src={getThumbnailUrl(image)}
                  fallback={image}
                  alt={`${projectTitle} — imagem ${index + 1}`}
                  rounded="none"
                  className="aspect-[9/20] w-full object-top"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {overflowing && images.length > 1 && (
        <div className="-mt-4 flex justify-center gap-1.5 pb-5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => scrollToPhone(index)}
              aria-label={`Ir para a imagem ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === current ? "w-5 bg-accent" : "w-1.5 bg-hairline-hover hover:bg-text-subtle",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
