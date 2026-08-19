import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
      <header className="mb-6 sm:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/70 mb-2">
          Projetos
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">
          {isEditing ? "Editar projeto" : "Novo projeto"}
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Descreva o projeto, envie imagens do sistema e anexe arquivos `.md`.
        </p>
      </header>

      {isEditing && isLoading && (
        <p className="text-sm text-text-muted animate-pulse">Carregando projeto...</p>
      )}

      {isEditing && error && (
        <div className="glass rounded-2xl p-4 text-sm text-red-300">
          Não foi possível carregar o projeto.
          <Link to="/admin/projects" className="block mt-3 text-accent hover:underline">
            Voltar para a lista
          </Link>
        </div>
      )}

      {(!isEditing || project) && <ProjectForm project={project ?? undefined} />}
    </div>
  );
}
