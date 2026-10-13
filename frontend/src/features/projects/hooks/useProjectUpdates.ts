import type { ProjectUpdateFormValues } from "@blog/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProjectUpdate,
  deleteProjectUpdate,
  fetchProjectUpdates,
  updateProjectUpdate,
} from "../api/projectUpdates.api";
import { projectKeys } from "./useProjects";

export const projectUpdateKeys = {
  admin: (projectId: string) => ["admin-project-updates", projectId] as const,
};

/** Lista e mutações das atualizações de um projeto (área admin) */
export function useProjectUpdates(projectId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: projectUpdateKeys.admin(projectId),
    queryFn: () => fetchProjectUpdates(projectId),
  });

  // O detalhe público carrega as atualizações junto com o projeto
  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: projectUpdateKeys.admin(projectId) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    ]);
  }

  const save = useMutation({
    mutationFn: ({ updateId, data }: { updateId?: string; data: ProjectUpdateFormValues }) =>
      updateId
        ? updateProjectUpdate(projectId, updateId, data)
        : createProjectUpdate(projectId, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (updateId: string) => deleteProjectUpdate(projectId, updateId),
    onSuccess: invalidate,
  });

  return { ...query, save, remove };
}
