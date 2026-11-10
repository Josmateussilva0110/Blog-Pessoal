import type { Project } from "@blog/shared"
import { PROJECTS_CACHE_TTL_MS, PUBLIC_CACHE_KEY } from "../../constants/cache"
import { ShortCache } from "../cache/shortCache"

/** Lista pública completa, usada pela home */
export const projectsListCache = new ShortCache<Project[]>(PROJECTS_CACHE_TTL_MS)
export const projectsCountCache = new ShortCache<number>(PROJECTS_CACHE_TTL_MS)
/** Detalhe público por slug, já com as atualizações */
export const projectDetailCache = new ShortCache<Project>(PROJECTS_CACHE_TTL_MS)

export function invalidateProjectsCache(): void {
  projectsListCache.delete(PUBLIC_CACHE_KEY)
  projectsCountCache.delete(PUBLIC_CACHE_KEY)
  // Limpa todos os slugs: uma edição pode ter trocado o slug do projeto
  projectDetailCache.deleteByPrefix("")
}
