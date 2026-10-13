import type { Project } from "@blog/shared"
import { ShortCache } from "../cache/shortCache"

export const projectsListCache = new ShortCache<Project[]>(30_000)
export const projectsCountCache = new ShortCache<number>(30_000)
/** Detalhe público por slug, já com as atualizações */
export const projectDetailCache = new ShortCache<Project>(30_000)

export function invalidateProjectsCache(): void {
  projectsListCache.delete("public")
  projectsCountCache.delete("public")
  // Limpa todos os slugs: uma edição pode ter trocado o slug do projeto
  projectDetailCache.deleteByPrefix("")
}
