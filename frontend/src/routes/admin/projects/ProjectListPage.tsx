import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAdminProjects } from "@/features/projects/hooks/useProjects";
import { StatusBadge } from "@/features/projects/components/StatusBadge";

export default function ProjectListPage() {
  const { data: projects, isLoading, error } = useAdminProjects();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-lg sm:text-xl font-medium text-text">Projetos</h1>
        <Link to="/admin/projects/new" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto">
            + Novo projeto
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted animate-pulse">Carregando...</p>
      ) : error ? (
        <div className="glass rounded-2xl p-6 text-sm text-red-300">
          Não foi possível carregar os projetos.
        </div>
      ) : projects?.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-sm text-text-muted">
          Nenhum projeto cadastrado ainda.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {projects?.map((project) => (
              <article
                key={project.id}
                className="glass rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="text-sm font-medium text-text leading-snug hover:text-accent transition-colors"
                  >
                    {project.title}
                  </Link>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-text-subtle">
                  {project.techStack.slice(0, 3).join(" · ")}
                </p>
                <Link to={`/admin/projects/${project.id}/edit`}>
                  <Button size="sm" variant="outline" className="w-full">
                    Editar
                  </Button>
                </Link>
              </article>
            ))}
          </div>

          <div className="hidden md:block glass rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">
                    Título
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">
                    Stack
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
              {projects?.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-surface-overlay/60"
                >
                  <td className="px-4 py-3 text-text">
                    <Link
                      to={`/admin/projects/${project.id}/edit`}
                      className="hover:text-accent transition-colors"
                    >
                      {project.title}
                    </Link>
                  </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-text-subtle">
                      {project.techStack.slice(0, 3).join(" · ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/projects/${project.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
