import type { ProjectUpdateFormValues } from "@blog/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProjectUpdate,
  deleteProjectUpdate,
  fetchProjectUpdates,
  updateProjectUpdate,
} from "../api/projectUpdates.api";
import { projectKeys } from "../lib/queryKeys";

/** Lista e mutações das atualizações de um projeto (área admin) */
export function useProjectUpdates(projectId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: projectKeys.updates(projectId),
    queryFn: () => fetchProjectUpdates(projectId),
  });

  // O detalhe público carrega as atualizações junto com o projeto
  async function invalidate() {
    // Só a lista de atualizações e as páginas públicas: invalidar o projeto em edição
    // (adminDetail) refaria o reset do formulário principal e perderia o que não foi salvo
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.updates(projectId) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.details() }),
      queryClient.invalidateQueries({ queryKey: projectKeys.home() }),
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
