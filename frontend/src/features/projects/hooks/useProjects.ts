import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HomeProjects } from "@blog/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchAdminProjects,
  fetchFeaturedProjects,
  fetchHomeProjects,
  fetchProjectBySlug,
} from "../api/projects.api";

export const projectKeys = {
  all: ["projects"] as const,
  admin: () => [...projectKeys.all, "admin"] as const,
  featured: () => [...projectKeys.all, "featured"] as const,
  home: () => [...projectKeys.all, "home"] as const,
  detail: (slug: string) => [...projectKeys.all, "detail", slug] as const,
};

/** Projetos da home já separados em destaque e restante pelo backend */
export function useHomeProjects() {
  return useQuery({
    queryKey: projectKeys.home(),
    queryFn: fetchHomeProjects,
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
  const queryClient = useQueryClient();
  // Admin logado acabou de editar: não pode ver a cópia do cache HTTP (até 60s)
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => fetchProjectBySlug(slug, isAuthenticated),
    enabled: Boolean(slug),
    // Vindo da home, o card já tem os dados: a página abre sem esperar a requisição
    placeholderData: () => {
      const home = queryClient.getQueryData<HomeProjects>(projectKeys.home());
      return [...(home?.spotlight ?? []), ...(home?.others ?? [])].find(
        (project) => project.slug === slug,
      );
    },
  });
}
