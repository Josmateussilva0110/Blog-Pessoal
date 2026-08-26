import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { TerminalConfirmModal } from "@/components/ui/TerminalConfirmModal";
import { useToast } from "@/components/ui/toast";
import { deleteProject } from "@/features/projects/api/projects.api";
import { useAdminProjects, projectKeys } from "@/features/projects/hooks/useProjects";
import { StatusBadge } from "@/features/projects/components/StatusBadge";
import { PlatformBadge } from "@/features/projects/components/PlatformBadge";
import type { Project } from "@blog/shared";

export default function ProjectListPage() {
  const { data: projects, isLoading, error } = useAdminProjects();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  async function confirmDelete() {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete.id);

    try {
      await deleteProject(projectToDelete.id);
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Projeto removido.");
      setProjectToDelete(null);
    } catch {
      toast.error("Não foi possível remover o projeto.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderActions(project: Project, fullWidth = false) {
    const isDeleting = deletingId === project.id;

    return (
      <div className={`flex gap-2${fullWidth ? "" : " justify-end"}`}>
        <Link to={`/admin/projects/${project.id}/edit`} className={fullWidth ? "flex-1" : undefined}>
          <Button size="sm" variant="outline" className={`font-mono${fullWidth ? " w-full" : ""}`}>
            edit()
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className={`font-mono text-red-300 border-red-500/30 hover:text-red-200 hover:border-red-400/50 hover:bg-red-500/10${fullWidth ? " flex-1" : ""}`}
          onClick={() => setProjectToDelete(project)}
          disabled={isDeleting}
        >
          {isDeleting ? "removing..." : "rm()"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Projetos"
        description="Cadastre, edite e organize os projetos exibidos no portfólio."
        action={
          <Link to="/admin/projects/new">
            <Button size="sm" className="font-mono">
              + new_project()
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="font-mono text-sm text-text-subtle animate-pulse">
          <span className="text-terminal">$ </span>
          loading projects...
        </p>
      ) : error ? (
        <div className="admin-card p-6 font-mono text-sm text-red-300">
          <span className="text-terminal">error: </span>
          Não foi possível carregar os projetos.
        </div>
      ) : projects?.length === 0 ? (
        <div className="admin-card p-8 text-center">
          <p className="font-mono text-sm text-text-muted">
            // nenhum projeto cadastrado ainda
          </p>
          <Link to="/admin/projects/new" className="mt-4 inline-block">
            <Button size="sm" className="font-mono">
              create_first()
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {projects?.map((project) => (
              <article key={project.id} className="admin-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="font-mono text-sm font-medium text-text leading-snug hover:text-accent transition-colors"
                  >
                    {project.title}
                  </Link>
                  <div className="flex flex-wrap gap-1.5">
                    <PlatformBadge platform={project.platform} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <p className="font-mono text-[10px] text-text-subtle">
                  {project.techStack.slice(0, 3).map((t) => `--${t.toLowerCase()}`).join(" ")}
                </p>
                {renderActions(project, true)}
              </article>
            ))}
          </div>

          <div className="admin-card hidden md:block overflow-x-auto">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-raised">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-terminal/80" />
              <span className="font-mono text-[10px] ml-1 text-text-subtle">
                $ ls ~/projects
              </span>
            </div>
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                    título
                  </th>
                  <th className="text-left px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                    status
                  </th>
                  <th className="text-left px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                    platform
                  </th>
                  <th className="text-left px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                    stack
                  </th>
                  <th className="text-right px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                    ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border-subtle/50 last:border-0 admin-table-row transition-colors"
                  >
                    <td className="px-5 py-4 text-text">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="font-mono hover:text-accent transition-colors"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PlatformBadge platform={project.platform} />
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-text-subtle">
                      {project.techStack.slice(0, 3).map((t) => `--${t.toLowerCase()}`).join(" ")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {renderActions(project)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <TerminalConfirmModal
        open={projectToDelete !== null}
        path="~/projects/rm.sh"
        title="rm --recursive --force"
        description="Deseja remover este projeto do portfólio?"
        targetLabel={projectToDelete?.title}
        confirmLabel="rm()"
        cancelLabel="abort()"
        isLoading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deletingId === null) {
            setProjectToDelete(null);
          }
        }}
      />
    </div>
  );
}
