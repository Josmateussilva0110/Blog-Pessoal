import type { Project } from "@blog/shared";

function sortProjectsByUpdatedAt(projects: Project[]) {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getHomeProjectSections(projects: Project[]) {
  const sorted = sortProjectsByUpdatedAt(projects);
  const featured = sorted.filter((project) => project.featured);
  const usesFeaturedSpotlight = featured.length > 0;

  const spotlightProjects = usesFeaturedSpotlight ? featured : sorted.slice(0, 3);
  const spotlightIds = new Set(spotlightProjects.map((project) => project.id));
  const remaining = sorted.filter((project) => !spotlightIds.has(project.id));

  return {
    spotlightProjects,
    remaining,
    usesFeaturedSpotlight,
  };
}
