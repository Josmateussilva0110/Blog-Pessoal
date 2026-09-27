import type { Project } from "@blog/shared";
import { getThumbnailUrl } from "@/lib/imageUrl";

/** Imagem de capa usada nos cards: capa explícita ou a primeira da galeria. */
export function getProjectCover(project: Project) {
  const original = project.coverImage ?? project.images[0];
  if (!original) return undefined;

  return { thumb: getThumbnailUrl(original), original };
}
