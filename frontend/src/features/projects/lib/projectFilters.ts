import type { HomeProjects, Project, ProjectPlatform } from "@blog/shared";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";

export type ProjectFilterId = "spotlight" | "all" | ProjectPlatform;

export type ProjectFilter = {
  id: ProjectFilterId;
  label: string;
  count: number;
};

const PLATFORMS: ProjectPlatform[] = ["mobile", "web"];

/** Projetos que o filtro mostra; a lista da home já vem completa do backend */
export function filterProjects(home: HomeProjects, filter: ProjectFilterId): Project[] {
  if (filter === "spotlight") return home.spotlight;

  const all = [...home.spotlight, ...home.others];
  if (filter === "all") return all;
  return all.filter((project) => normalizeProjectPlatform(project.platform) === filter);
}

/** Filtros com contagem; plataformas sem projeto ficam de fora */
export function buildProjectFilters(home: HomeProjects): ProjectFilter[] {
  const spotlightLabel = home.spotlightMode === "featured" ? "Destaques" : "Recentes";
  const filters: ProjectFilter[] = [
    { id: "spotlight", label: spotlightLabel, count: home.spotlight.length },
    { id: "all", label: "Todos", count: home.spotlight.length + home.others.length },
    ...PLATFORMS.map((platform) => ({
      id: platform,
      label: PLATFORM_LABELS[platform],
      count: filterProjects(home, platform).length,
    })),
  ];

  return filters.filter((filter) => filter.count > 0);
}
