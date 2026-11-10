import { Link, useParams } from "react-router-dom";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { ProjectUpdatesManager } from "@/features/projects/components/ProjectUpdatesManager";
import { useAdminProject } from "@/features/projects/hooks/useProjects";
import { ErrorState } from "@/components/ui/ErrorState";
import { INLINE_LINK_CLASS } from "@/components/ui/linkStyles";
import { ROUTES } from "@/config/routes";

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: project, isLoading, error, isRefetching, refetch } = useAdminProject(id);

  return (
    <div className="w-full">
      <AdminPageHeader
        eyebrow="Projetos"
        title={isEditing ? "Editar projeto" : "Novo projeto"}
        description="Descreva o projeto, envie imagens do sistema e anexe arquivos .md."
      />

      {isEditing && isLoading && (
        <p role="status" className="animate-pulse text-sm text-home-muted">
          Carregando projeto…
        </p>
      )}

      {isEditing && error && (
        <div className="admin-card space-y-4 p-5">
          <ErrorState
            message="Não foi possível carregar o projeto."
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
          />
          <Link to={ROUTES.adminProjects} className={INLINE_LINK_CLASS}>
            Voltar para a lista
          </Link>
        </div>
      )}

      {(!isEditing || project) && (
        <div className="admin-card p-4 sm:p-6 lg:p-8">
          <ProjectForm project={project ?? undefined} />
        </div>
      )}

      {/* Atualizações dependem do projeto já existir */}
      {isEditing && project && (
        <div className="admin-card mt-3 p-4 sm:p-6 lg:p-8">
          <ProjectUpdatesManager projectId={project.id} />
        </div>
      )}
    </div>
  );
}
