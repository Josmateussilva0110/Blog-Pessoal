import type { Project } from "@blog/shared";
import { getThumbnailUrl } from "@/lib/imageUrl";

/** Larguras máximas geradas no upload (backend: imageProcessing.ts) */
const THUMB_WIDTH = 480;
const ORIGINAL_WIDTH = 1920;

/** Imagem de capa usada nos cards: capa explícita ou a primeira da galeria. */
export function getProjectCover(project: Project) {
  const original = project.coverImage ?? project.images[0];
  if (!original) return undefined;

  const thumb = getThumbnailUrl(original);

  return {
    thumb,
    original,
    /** Miniatura e original: o navegador escolhe pela largura exibida e pela densidade da tela */
    srcSet: thumb === original ? undefined : `${thumb} ${THUMB_WIDTH}w, ${original} ${ORIGINAL_WIDTH}w`,
  };
}
