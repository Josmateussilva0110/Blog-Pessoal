import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { StatusBadge } from "@/features/projects/components/StatusBadge";

export function ProjectListPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Projetos</h1>
        <Link to="/admin/projetos/novo">
          <Button size="sm">+ Novo projeto</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="font-mono text-sm text-text-muted animate-pulse">
          carregando...
        </p>
      ) : (
        <div className="border border-border-subtle rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-raised">
                <th className="text-left px-4 py-3 font-mono text-xs text-text-muted uppercase">
                  Título
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs text-text-muted uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs text-text-muted uppercase hidden sm:table-cell">
                  Stack
                </th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-surface-overlay/50"
                >
                  <td className="px-4 py-3 text-text">{project.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-subtle hidden sm:table-cell">
                    {project.techStack.slice(0, 3).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
