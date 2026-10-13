import type { ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TerminalConfirmModal } from "@/components/ui/TerminalConfirmModal";
import { useToast } from "@/components/ui/toast";
import { ProjectUpdateForm } from "@/features/projects/components/ProjectUpdateForm";
import { useProjectUpdates } from "@/features/projects/hooks/useProjectUpdates";
import { formatDate } from "@/lib/format";

/** "new" abre o formulário vazio; um id abre a edição daquela atualização */
type EditingState = "new" | string | null;

/** Gerencia o changelog do projeto na página de edição */
export function ProjectUpdatesManager({ projectId }: { projectId: string }) {
  const toast = useToast();
  const { data: updates = [], isLoading, error, save, remove } = useProjectUpdates(projectId);
  const [editing, setEditing] = useState<EditingState>(null);
  const [toDelete, setToDelete] = useState<ProjectUpdate | null>(null);

  async function handleSave(values: ProjectUpdateFormValues, updateId?: string) {
    try {
      await save.mutateAsync({ updateId, data: values });
      toast.success(updateId ? "Atualização salva." : "Atualização publicada.");
      setEditing(null);
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Não foi possível salvar a atualização.",
      );
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;

    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Atualização excluída.");
      setToDelete(null);
    } catch {
      toast.error("Não foi possível excluir a atualização.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">Atualizações</h2>
          <p className="text-sm text-text-muted">
            Registre o que mudou no projeto. Aparece como linha do tempo na página pública.
          </p>
        </div>
        {editing !== "new" && (
          <Button size="sm" onClick={() => setEditing("new")}>
            Nova atualização
          </Button>
        )}
      </div>

      {editing === "new" && (
        <ProjectUpdateForm
          isSaving={save.isPending}
          onSubmit={(values) => void handleSave(values)}
          onCancel={() => setEditing(null)}
        />
      )}

      {isLoading && (
        <p className="font-mono text-sm text-text-subtle animate-pulse">
          <span className="text-terminal">$ </span>
          loading updates...
        </p>
      )}

      {error && (
        <p className="font-mono text-sm text-danger-text">
          Não foi possível carregar as atualizações.
        </p>
      )}

      {!isLoading && !error && updates.length === 0 && editing !== "new" && (
        <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-text-subtle">
          Nenhuma atualização publicada ainda.
        </p>
      )}

      {updates.length > 0 && (
        <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle">
          {updates.map((update) =>
            editing === update.id ? (
              <li key={update.id} className="p-2">
                <ProjectUpdateForm
                  update={update}
                  isSaving={save.isPending}
                  onSubmit={(values) => void handleSave(values, update.id)}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li
                key={update.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-text-subtle">
                    {formatDate(update.publishedAt)}
                    {update.version && <span className="ml-2 text-accent">{update.version}</span>}
                  </p>
                  <p className="truncate text-sm font-medium text-text">{update.title}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono"
                    onClick={() => setEditing(update.id)}
                  >
                    edit()
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-danger-text border-danger/30 hover:text-danger-text hover:border-danger/50 hover:bg-danger/10"
                    onClick={() => setToDelete(update)}
                  >
                    rm()
                  </Button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      <TerminalConfirmModal
        open={toDelete !== null}
        path="~/projects/updates/rm.sh"
        title="rm --force"
        description="Deseja remover esta atualização do projeto?"
        targetLabel={toDelete?.title}
        confirmLabel="rm()"
        cancelLabel="abort()"
        isLoading={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!remove.isPending) setToDelete(null);
        }}
      />
    </div>
  );
}
