import type { Project } from "@blog/shared";
import { getThumbnailSrcSet, getThumbnailUrl } from "@/lib/imageUrl";

/** Imagem de capa usada nos cards: capa explícita ou a primeira da galeria. */
export function getProjectCover(project: Project) {
  const original = project.coverImage ?? project.images[0];
  if (!original) return undefined;

  return {
    /** Maior miniatura: `src` de reserva para quem não lê `srcSet` */
    thumb: getThumbnailUrl(original),
    original,
    /** Miniaturas e original: o navegador escolhe pela largura exibida e pela densidade da tela */
    srcSet: getThumbnailSrcSet(original),
  };
}
