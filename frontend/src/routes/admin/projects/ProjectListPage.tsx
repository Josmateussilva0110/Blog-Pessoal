import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { useAdminProjects } from "@/features/projects/hooks/useProjects";
import { StatusBadge } from "@/features/projects/components/StatusBadge";

export default function ProjectListPage() {
  const { data: projects, isLoading, error } = useAdminProjects();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Projetos"
        description="Cadastre, edite e organize os projetos exibidos no portfólio."
        action={
          <Link to="/admin/projects/new">
            <Button size="sm">+ Novo projeto</Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-zinc-500 animate-pulse">Carregando...</p>
      ) : error ? (
        <div className="admin-card p-6 text-sm text-red-300">
          Não foi possível carregar os projetos.
        </div>
      ) : projects?.length === 0 ? (
        <div className="admin-card p-8 text-center">
          <p className="text-sm text-zinc-400">Nenhum projeto cadastrado ainda.</p>
          <Link to="/admin/projects/new" className="mt-4 inline-block">
            <Button size="sm">Criar primeiro projeto</Button>
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
                    className="text-sm font-medium text-zinc-100 leading-snug hover:text-emerald-300 transition-colors"
                  >
                    {project.title}
                  </Link>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-zinc-500">
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

          <div className="admin-card hidden md:block overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Título
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Status
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Stack
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-zinc-100">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="hover:text-emerald-300 transition-colors"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {project.techStack.slice(0, 3).join(" · ")}
                    </td>
                    <td className="px-5 py-4 text-right">
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
