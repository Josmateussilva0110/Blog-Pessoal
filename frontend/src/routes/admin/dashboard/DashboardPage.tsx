import { Link } from "react-router-dom";
import { ArrowUpRight, FolderKanban, Sparkles, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdminProjects } from "@/features/projects/hooks/useProjects";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useAdminProjects();

  const total = projects?.length ?? 0;
  const featured = projects?.filter((project) => project.featured).length ?? 0;
  const inProgress = projects?.filter((project) => project.status === "wip").length ?? 0;

  const stats = [
    {
      label: "projetos cadastrados",
      value: isLoading ? "—" : total,
      icon: FolderKanban,
    },
    {
      label: "em destaque",
      value: isLoading ? "—" : featured,
      icon: Sparkles,
    },
    {
      label: "em andamento",
      value: isLoading ? "—" : inProgress,
      icon: Wrench,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`Olá${user?.username ? `, ${user.username}` : ""}`}
        description="Acompanhe o portfólio e acesse rapidamente as principais ações do painel."
        action={
          <Link to="/admin/projects/new">
            <Button size="sm" className="font-mono">
              new_project()
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="admin-stat p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="text-3xl font-bold tracking-tight text-text">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-subtle">
                {stat.label}
              </p>
            </article>
          );
        })}
      </div>

      <section className="admin-card mt-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="code-comment mb-1">// atalhos</p>
            <h2 className="text-base font-semibold text-text">Ações rápidas</h2>
            <p className="mt-1 text-sm text-text-muted">
              Gerencie projetos, ajuste sua conta ou volte ao site público.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/admin/projects">
              <Button variant="outline" size="sm" className="font-mono">
                list_projects()
              </Button>
            </Link>
            <Link to="/admin/links">
              <Button variant="outline" size="sm" className="font-mono">
                edit_links()
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="ghost" size="sm" className="font-mono">
                settings()
              </Button>
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="font-mono">
                open_site()
                <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
