import type { Project } from "@blog/shared";
// Subcaminho só com constantes: o índice do shared carrega os schemas (zod)
import { PROJECT_IMAGE_MAX_WIDTH, PROJECT_THUMB_MAX_WIDTH } from "@blog/shared/constants";
import { getThumbnailUrl } from "@/lib/imageUrl";

/** Imagem de capa usada nos cards: capa explícita ou a primeira da galeria. */
export function getProjectCover(project: Project) {
  const original = project.coverImage ?? project.images[0];
  if (!original) return undefined;

  const thumb = getThumbnailUrl(original);

  return {
    thumb,
    original,
    /** Miniatura e original: o navegador escolhe pela largura exibida e pela densidade da tela */
    srcSet: thumb === original ? undefined : `${thumb} ${PROJECT_THUMB_MAX_WIDTH}w, ${original} ${PROJECT_IMAGE_MAX_WIDTH}w`,
  };
}
