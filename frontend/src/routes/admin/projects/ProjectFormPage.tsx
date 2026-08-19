import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { projectsService } from "@/service";
import { env } from "@/config/env";
import { getMockProjectById } from "@/features/projects/api/mock-data";

async function fetchProjectById(id: string) {
  if (env.useMock) {
    return getMockProjectById(id) ?? null;
  }

  const result = await projectsService.getById(id);
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["admin-project", id],
    queryFn: () => fetchProjectById(id!),
    enabled: isEditing,
  });

  return (
    <div className="max-w-3xl w-full">
      <AdminPageHeader
        eyebrow="Projetos"
        title={isEditing ? "Editar projeto" : "Novo projeto"}
        description="Descreva o projeto, envie imagens do sistema e anexe arquivos `.md`."
      />

      {isEditing && isLoading && (
        <p className="text-sm text-zinc-500 animate-pulse">Carregando projeto...</p>
      )}

      {isEditing && error && (
        <div className="admin-card p-4 text-sm text-red-300">
          Não foi possível carregar o projeto.
          <Link to="/admin/projects" className="block mt-3 text-emerald-300 hover:underline">
            Voltar para a lista
          </Link>
        </div>
      )}

      {(!isEditing || project) && (
        <div className="admin-card p-5 sm:p-6">
          <ProjectForm project={project ?? undefined} />
        </div>
      )}
    </div>
  );
}
