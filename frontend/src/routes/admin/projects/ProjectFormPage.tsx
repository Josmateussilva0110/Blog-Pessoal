import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
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
        <p className="font-mono text-sm text-text-subtle animate-pulse">
          <span className="text-terminal">$ </span>
          loading project...
        </p>
      )}

      {isEditing && error && (
        <div className="admin-card p-4 font-mono text-sm text-red-300">
          <span className="text-terminal">error: </span>
          Não foi possível carregar o projeto.
          <Link to="/admin/projects" className="block mt-3 text-accent hover:underline">
            ← voltar para a lista
          </Link>
        </div>
      )}

      {(!isEditing || project) && (
        <div className="admin-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-raised">
            <span className="h-2 w-2 rounded-full bg-red-500/80" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="h-2 w-2 rounded-full bg-terminal/80" />
            <span className="font-mono text-[10px] ml-1 text-text-subtle">
              $ vim {isEditing ? project?.slug : "new-project"}.md
            </span>
          </div>
          <div className="p-4 sm:p-5 lg:p-6">
            <ProjectForm project={project ?? undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
