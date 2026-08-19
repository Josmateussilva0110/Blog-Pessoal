import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminProjects,
  fetchFeaturedProjects,
  fetchProjectBySlug,
  fetchProjects,
} from "../api/projects.api";

export const projectKeys = {
  all: ["projects"] as const,
  admin: () => [...projectKeys.all, "admin"] as const,
  featured: () => [...projectKeys.all, "featured"] as const,
  detail: (slug: string) => [...projectKeys.all, "detail", slug] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: fetchProjects,
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: projectKeys.admin(),
    queryFn: fetchAdminProjects,
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: projectKeys.featured(),
    queryFn: fetchFeaturedProjects,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => fetchProjectBySlug(slug),
    enabled: Boolean(slug),
  });
}
