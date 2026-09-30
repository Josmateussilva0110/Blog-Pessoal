import type { Project } from "@blog/shared";

/** Ids das seções da home usados em âncoras (/#id) e no scroll programático */
export const SECTION_IDS = {
  projects: "projetos",
  about: "sobre",
} as const;

const PROJECT_PATH_PREFIX = "/projects/";

export const ROUTES = {
  home: "/",
  projectsSection: `/#${SECTION_IDS.projects}`,
  aboutSection: `/#${SECTION_IDS.about}`,
  project: (slug: string) => `${PROJECT_PATH_PREFIX}${slug}`,
  adminProjects: "/admin/projects",
  adminProjectEdit: (id: Project["id"]) => `/admin/projects/${id}/edit`,
} as const;

/** Página de detalhe de um projeto (layout mais largo, transição de slide) */
export function isProjectDetailPath(pathname: string) {
  return pathname.startsWith(PROJECT_PATH_PREFIX);
}
