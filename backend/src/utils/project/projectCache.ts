import type { Project } from "@blog/shared"
import { ShortCache } from "../cache/shortCache"

export const projectsListCache = new ShortCache<Project[]>(30_000)
export const projectsCountCache = new ShortCache<number>(30_000)

export function invalidateProjectsCache(): void {
  projectsListCache.delete("public")
  projectsCountCache.delete("public")
}
