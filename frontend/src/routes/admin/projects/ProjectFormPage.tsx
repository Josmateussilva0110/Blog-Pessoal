import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { ProjectUpdatesManager } from "@/features/projects/components/ProjectUpdatesManager";
import { fetchProjectById } from "@/features/projects/api/projects.api";

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["admin-project", id],
    queryFn: () => fetchProjectById(id!),
    enabled: isEditing,
  });

  return (
    <div className="w-full">
      <AdminPageHeader
        eyebrow="Projetos"
        title={isEditing ? "Editar projeto" : "Novo projeto"}
        description="Descreva o projeto, envie imagens do sistema e anexe arquivos `.md`."
      />

      {isEditing && isLoading && (
        <p role="status" className="animate-pulse text-sm text-home-muted">
          Carregando projeto…
        </p>
      )}

      {isEditing && error && (
        <div role="alert" className="admin-card p-5 text-sm text-danger-text">
          Não foi possível carregar o projeto.
          <Link
            to="/admin/projects"
            className="mt-3 block text-brand underline decoration-brand/40 underline-offset-[3px] hover:decoration-brand"
          >
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
