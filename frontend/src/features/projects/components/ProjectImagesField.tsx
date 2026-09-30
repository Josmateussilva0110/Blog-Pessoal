import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { LocalImage } from "@/features/projects/hooks/useProjectImages";
import { cn } from "@/lib/format";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

const imageActionClass = cn(
  "inline-flex size-7 items-center justify-center rounded-md bg-black/60 text-white transition-colors",
  "hover:bg-black/80 disabled:pointer-events-none disabled:opacity-35",
);

type ProjectImagesFieldProps = {
  images: LocalImage[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

/** Seção de imagens do formulário: upload, ordem (a primeira é a capa) e remoção */
export function ProjectImagesField({ images, onAdd, onRemove, onMove }: ProjectImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelection(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    // Limpa para permitir escolher o mesmo arquivo de novo
    event.target.value = "";
    onAdd(selected);
  }

  return (
    <section className="admin-card-muted p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-text">Imagens do sistema</h2>
        <p className="text-xs text-text-muted mt-1">
          Prints e capturas de tela do projeto (JPEG, PNG, WebP ou GIF). A primeira imagem
          será usada como capa.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        className="hidden"
        onChange={handleSelection}
      />

      <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
        Adicionar imagens
      </Button>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <span className="absolute top-2 left-2 z-10 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[10px] text-white">
                #{index + 1}
              </span>
              <img
                src={image.url}
                alt={`Imagem ${index + 1} do projeto`}
                className="w-full aspect-video object-cover rounded-xl border border-hairline-strong"
              />
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  type="button"
                  className={imageActionClass}
                  aria-label="Mover imagem para cima"
                  disabled={index === 0}
                  onClick={() => onMove(image.id, "up")}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={imageActionClass}
                  aria-label="Mover imagem para baixo"
                  disabled={index === images.length - 1}
                  onClick={() => onMove(image.id, "down")}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(image.id)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
