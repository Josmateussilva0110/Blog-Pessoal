import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Plus } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/toast";
import { deleteProject } from "@/features/projects/api/projects.api";
import { useAdminProjects, projectKeys } from "@/features/projects/hooks/useProjects";
import { StatusBadge } from "@/features/projects/components/StatusBadge";
import { PlatformBadge } from "@/features/projects/components/PlatformBadge";
import type { Project } from "@blog/shared";
import { getTechMeta } from "@/lib/skillicons";
import { cn } from "@/lib/format";

/** Primeiras tecnologias com a grafia padronizada ("TypeScript · React Native") */
function stackSummary(project: Project) {
  return project.techStack.slice(0, 3).map((tech) => getTechMeta(tech).label).join(" · ");
}

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
      <div className={cn("flex gap-2", !fullWidth && "justify-end")}>
        <Link
          to={`/admin/projects/${project.id}/edit`}
          className={buttonClassName({ size: "sm", variant: "secondary", className: cn(fullWidth && "flex-1") })}
        >
          Editar
        </Link>
        <Button
          size="sm"
          variant="danger-ghost"
          className={cn(fullWidth && "flex-1")}
          onClick={() => setProjectToDelete(project)}
          disabled={isDeleting}
        >
          {isDeleting ? "Removendo…" : "Remover"}
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
          <Link to="/admin/projects/new" className={buttonClassName()}>
            <Plus className="size-4" aria-hidden />
            Novo projeto
          </Link>
        }
      />

      {isLoading ? (
        <p role="status" className="animate-pulse text-sm text-home-muted">
          Carregando projetos…
        </p>
      ) : error ? (
        <div role="alert" className="admin-card p-6 text-sm text-danger-text">
          Não foi possível carregar os projetos.
        </div>
      ) : projects?.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <p className="text-sm text-home-muted">Nenhum projeto cadastrado ainda.</p>
          <Link to="/admin/projects/new" className={buttonClassName({ className: "mt-4" })}>
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {projects?.map((project) => (
              <article key={project.id} className="admin-card space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="font-medium leading-snug text-home-ink transition-colors hover:text-brand"
                  >
                    {project.title}
                  </Link>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <PlatformBadge platform={project.platform} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <p className="text-xs text-home-muted">{stackSummary(project)}</p>
                {renderActions(project, true)}
              </article>
            ))}
          </div>

          <div className="admin-card hidden overflow-x-auto md:block">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-home-line text-left text-xs font-medium text-home-muted">
                  <th scope="col" className="px-5 py-4 font-medium">Título</th>
                  <th scope="col" className="px-5 py-4 font-medium">Status</th>
                  <th scope="col" className="px-5 py-4 font-medium">Plataforma</th>
                  <th scope="col" className="px-5 py-4 font-medium">Stack</th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr
                    key={project.id}
                    className="admin-table-row border-b border-home-line transition-colors last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="font-medium text-home-ink transition-colors hover:text-brand"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PlatformBadge platform={project.platform} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-home-muted">{stackSummary(project)}</td>
                    <td className="px-5 py-3.5 text-right">{renderActions(project)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        open={projectToDelete !== null}
        title="Remover projeto"
        description="Deseja remover este projeto do portfólio?"
        targetLabel={projectToDelete?.title}
        confirmLabel="Remover"
        loadingLabel="Removendo…"
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
