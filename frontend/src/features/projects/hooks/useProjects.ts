import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HomeProjects } from "@blog/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchAdminProjects,
  fetchHomeProjects,
  fetchProjectById,
  fetchProjectBySlug,
} from "../api/projects.api";
import { projectKeys } from "../lib/queryKeys";

/** Projetos da home já separados em destaque e restante pelo backend */
export function useHomeProjects() {
  return useQuery({
    queryKey: projectKeys.home(),
    queryFn: fetchHomeProjects,
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: projectKeys.adminList(),
    queryFn: fetchAdminProjects,
  });
}

/** Projeto aberto no formulário de edição (busca por id, inclui não publicados) */
export function useAdminProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.adminDetail(id ?? ""),
    queryFn: () => fetchProjectById(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useProject(slug: string) {
  const queryClient = useQueryClient();
  // Admin logado acabou de editar: não pode ver a cópia do cache HTTP (até 60s)
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: projectKeys.detail(slug, isAuthenticated),
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
