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
      label: "Projetos cadastrados",
      value: isLoading ? "—" : total,
      icon: FolderKanban,
    },
    {
      label: "Em destaque",
      value: isLoading ? "—" : featured,
      icon: Sparkles,
    },
    {
      label: "Em andamento",
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
            <Button size="sm">Novo projeto</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="admin-stat p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-emerald-300">
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="text-3xl font-semibold tracking-tight text-zinc-50">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
            </article>
          );
        })}
      </div>

      <section className="admin-card mt-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Atalhos</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Gerencie projetos, ajuste sua conta ou volte ao site público.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/admin/projects">
              <Button variant="outline" size="sm">
                Ver projetos
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="ghost" size="sm">
                Configurações
              </Button>
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                Site público
                <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
