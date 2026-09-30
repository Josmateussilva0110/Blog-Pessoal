import type { HomeProjects, Project } from "@blog/shared"

/** Quantos projetos recentes vão para o destaque quando nenhum está marcado */
export const HOME_RECENT_SPOTLIGHT_SIZE = 3

/**
 * Separa os projetos da home: os marcados como destaque, ou (sem nenhum
 * marcado) os mais recentes. Espera a lista já ordenada por updatedAt.
 */
export function splitHomeProjects(projects: Project[]): HomeProjects {
  const featured = projects.filter((project) => project.featured)
  const spotlightMode = featured.length > 0 ? "featured" : "recent"
  const spotlight =
    spotlightMode === "featured" ? featured : projects.slice(0, HOME_RECENT_SPOTLIGHT_SIZE)
  const spotlightIds = new Set(spotlight.map((project) => project.id))

  return {
    spotlight,
    others: projects.filter((project) => !spotlightIds.has(project.id)),
    spotlightMode,
  }
}
