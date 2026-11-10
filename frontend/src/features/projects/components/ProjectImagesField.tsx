import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import {
  formatMegabytes,
  IMAGE_FORMAT_LABELS,
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_MIME_TYPES,
  PROJECT_IMAGES_MAX_COUNT,
} from "@blog/shared/constants";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { partitionImageFiles } from "@/lib/imageFiles";
import type { LocalImage } from "@/features/projects/hooks/useProjectImages";
import { cn } from "@/lib/cn";

// Mesmos formatos que o backend aceita no upload
const ACCEPTED_IMAGE_TYPES = PROJECT_IMAGE_MIME_TYPES.join(",");

const imageActionClass = cn(
  "inline-flex size-7 items-center justify-center rounded-md bg-scrim/60 text-on-scrim transition-colors",
  "hover:bg-scrim/80 focus-visible:outline-2 focus-visible:outline-brand",
  "disabled:pointer-events-none disabled:opacity-35",
);

type ProjectImagesFieldProps = {
  images: LocalImage[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

/** Seção de imagens do formulário: upload, ordem (a primeira é a capa) e remoção */
export function ProjectImagesField({ images, onAdd, onRemove, onMove }: ProjectImagesFieldProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  // O backend aceita até PROJECT_IMAGES_MAX_COUNT arquivos novos por envio
  const newImagesCount = images.filter((image) => image.file).length;
  const remainingSlots = Math.max(PROJECT_IMAGES_MAX_COUNT - newImagesCount, 0);

  function handleSelection(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    // Limpa para permitir escolher o mesmo arquivo de novo
    event.target.value = "";

    const { accepted, rejected } = partitionImageFiles(selected, {
      mimeTypes: PROJECT_IMAGE_MIME_TYPES,
      maxBytes: PROJECT_IMAGE_MAX_BYTES,
    });
    const toAdd = accepted.slice(0, remainingSlots);

    if (rejected.length > 0) {
      toast.error(
        `${rejected.length} arquivo(s) ignorado(s): use ${IMAGE_FORMAT_LABELS} de até ${formatMegabytes(PROJECT_IMAGE_MAX_BYTES)}.`,
      );
    }
    if (toAdd.length < accepted.length) {
      toast.error(`Envie no máximo ${PROJECT_IMAGES_MAX_COUNT} imagens novas por vez.`);
    }

    onAdd(toAdd);
  }

  return (
    <section className="admin-card-muted p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-home-ink">Imagens do sistema</h2>
        <p className="text-xs text-home-muted mt-1">
          Prints e capturas de tela do projeto ({IMAGE_FORMAT_LABELS}, até{" "}
          {formatMegabytes(PROJECT_IMAGE_MAX_BYTES)} cada e {PROJECT_IMAGES_MAX_COUNT} novas por
          envio). A primeira imagem será usada como capa.
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
              <span className="absolute left-2 top-2 z-10 rounded-md bg-scrim/65 px-2 py-0.5 font-mono text-2xs text-on-scrim">
                #{index + 1}
              </span>
              <img
                src={image.url}
                alt={`Imagem ${index + 1} do projeto`}
                className="aspect-video w-full rounded-xl border border-home-line object-cover"
              />
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  type="button"
                  className={imageActionClass}
                  aria-label={`Mover imagem ${index + 1} para cima`}
                  disabled={index === 0}
                  onClick={() => onMove(image.id, "up")}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={imageActionClass}
                  aria-label={`Mover imagem ${index + 1} para baixo`}
                  disabled={index === images.length - 1}
                  onClick={() => onMove(image.id, "down")}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                // No desktop aparece no hover, e também quando algo do card recebe foco pelo teclado
                className="absolute top-2 right-2 rounded-lg bg-scrim/60 px-2 py-1 text-2xs text-on-scrim opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                aria-label={`Remover imagem ${index + 1}`}
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
