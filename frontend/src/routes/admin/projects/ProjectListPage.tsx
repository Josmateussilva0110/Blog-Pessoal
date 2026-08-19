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
                  <StatusBadge status={project.status} />
                </div>
                <p className="font-mono text-[10px] text-text-subtle">
                  {project.techStack.slice(0, 3).map((t) => `--${t.toLowerCase()}`).join(" ")}
                </p>
                <Link to={`/admin/projects/${project.id}/edit`}>
                  <Button size="sm" variant="outline" className="w-full font-mono">
                    edit()
                  </Button>
                </Link>
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
                    <td className="px-5 py-4 font-mono text-[10px] text-text-subtle">
                      {project.techStack.slice(0, 3).map((t) => `--${t.toLowerCase()}`).join(" ")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/admin/projects/${project.id}/edit`}>
                        <Button size="sm" variant="outline" className="font-mono">
                          edit()
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
