import { Link } from "react-router-dom";
import { ArrowUpRight, FolderKanban, Plus, Sparkles, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { buttonClassName } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdminProjects } from "@/features/projects/hooks/useProjects";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading, isError, isRefetching, refetch } = useAdminProjects();
  // Sem dados (carregando ou falha) os contadores mostram traço, nunca um 0 falso
  const hasData = Boolean(projects);

  const total = projects?.length ?? 0;
  const featured = projects?.filter((project) => project.featured).length ?? 0;
  const inProgress = projects?.filter((project) => project.status === "wip").length ?? 0;

  const stats = [
    { label: "Projetos cadastrados", value: hasData ? total : "—", icon: FolderKanban },
    { label: "Em destaque", value: hasData ? featured : "—", icon: Sparkles },
    { label: "Em andamento", value: hasData ? inProgress : "—", icon: Wrench },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Painel"
        title={`Olá${user?.username ? `, ${user.username}` : ""}`}
        description="Acompanhe o portfólio e acesse rapidamente as principais ações do painel."
        action={
          <Link to={ROUTES.adminProjectNew} className={buttonClassName({ size: "md" })}>
            <Plus className="size-4" aria-hidden />
            Novo projeto
          </Link>
        }
      />

      {isError && !isLoading && (
        <ErrorState
          className="admin-card mb-3 p-5"
          message="Não foi possível carregar os projetos."
          onRetry={() => void refetch()}
          isRetrying={isRefetching}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="admin-stat p-5 sm:p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-home-inset text-brand">
                <Icon className="size-[1.125rem]" aria-hidden />
              </span>
              <p className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-home-ink">{stat.value}</p>
              <p className="mt-1 text-sm text-home-muted">{stat.label}</p>
            </article>
          );
        })}
      </div>

      <section aria-labelledby="atalhos" className="admin-card mt-3 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="atalhos" className="text-lg font-semibold tracking-heading text-home-ink">
              Ações rápidas
            </h2>
            <p className="mt-1 text-sm text-home-muted">
              Gerencie projetos, ajuste sua conta ou volte ao site público.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.adminProjects} className={buttonClassName({ variant: "secondary" })}>
              Ver projetos
            </Link>
            <Link to={ROUTES.adminLinks} className={buttonClassName({ variant: "secondary" })}>
              Editar links
            </Link>
            <Link to={ROUTES.adminSettings} className={buttonClassName({ variant: "ghost" })}>
              Configurações
            </Link>
            <a href={ROUTES.home} target="_blank" rel="noopener noreferrer" className={buttonClassName({ variant: "ghost" })}>
              Abrir site
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
