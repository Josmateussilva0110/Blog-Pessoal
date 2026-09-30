import { ArrowLeft, ArrowUpRight, ChevronDown, CodeXml, Pencil } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { ProjectImageGallery } from "@/features/projects/components/ProjectImageGallery";
import { ProjectDetailSkeleton } from "@/features/projects/components/ProjectDetailSkeleton";
import { ProjectInfo } from "@/features/projects/components/ProjectInfo";
import { ProjectToc } from "@/features/projects/components/ProjectToc";
import { StatusDot } from "@/features/projects/components/StatusDot";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { SITE } from "@/config/constants";
import { ROUTES, SECTION_IDS } from "@/config/routes";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn, formatDate } from "@/lib/format";
import { extractHeadings } from "@/lib/markdownHeadings";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { getStatusLabel } from "@/lib/utils";
import { projectTransitionName, scrollToPageTop } from "@/lib/viewTransition";

const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors";

/** Breakpoint lg: a partir dele o índice fica na coluna lateral */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const headings = useMemo(
    () => extractHeadings(project?.contentMarkdown ?? ""),
    [project?.contentMarkdown],
  );

  useDocumentTitle(project ? `${project.title} — ${SITE.name}` : null);

  useEffect(() => {
    scrollToPageTop("instant");
  }, [slug]);

  function handleBack(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!project) return;
    closeProject(project, () => {
      navigate(ROUTES.home, { state: { scrollTo: SECTION_IDS.projects } });
    });
  }

  if (isLoading) {
    return <ProjectDetailSkeleton slug={slug} />;
  }

  if (!project) {
    return (
      <div className="py-20 text-center terminal-card">
        <p className="text-text-muted">Projeto não encontrado.</p>
        <Link to={ROUTES.home} className="text-accent text-sm mt-4 inline-block hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const status = normalizeProjectStatus(project.status);
  const platform = normalizeProjectPlatform(project.platform);
  const hasDocs = Boolean(project.contentMarkdown || project.description);
  // Um só índice montado por vez (cada um escuta o scroll)
  const hasToc = headings.length > 1;

  return (
    <article
      className="py-6 sm:py-8 project-detail-vt"
      style={{ viewTransitionName: projectTransitionName(slug) }}
    >
      <a
        href={ROUTES.projectsSection}
        onClick={handleBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        Voltar aos projetos
      </a>

      <header className="mt-8 mb-8 sm:mb-10 max-w-3xl">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
          <span className="inline-flex items-center gap-2">
            <StatusDot status={status} />
            {getStatusLabel(status)}
          </span>
          <span aria-hidden>·</span>
          <span>{PLATFORM_LABELS[platform]}</span>
          {/* No celular a data já aparece no cartão logo abaixo */}
          <span aria-hidden className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Atualizado em {formatDate(project.updatedAt)}</span>
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
          {project.title}
        </h1>

        {project.description && (
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
            {project.description}
          </p>
        )}

        {(project.repoUrl || isAuthenticated) && (
          <div className="mt-6 grid gap-2.5 min-[420px]:flex min-[420px]:flex-wrap">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(actionClass, "border-accent/30 bg-accent-soft text-accent hover:bg-accent/20")}
              >
                <CodeXml className="size-4" aria-hidden />
                Ver código
                <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
              </a>
            )}
            {isAuthenticated && (
              <Link
                to={ROUTES.adminProjectEdit(project.id)}
                className={cn(actionClass, "border-hairline-strong text-text-muted hover:border-hairline-hover hover:text-text")}
              >
                <Pencil className="size-4" aria-hidden />
                Editar
              </Link>
            )}
          </div>
        )}
      </header>

      {project.images.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <ProjectImageGallery
            images={project.images}
            projectTitle={project.title}
            platform={project.platform}
          />
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 xl:gap-16">
        <div className="min-w-0">
          {hasDocs && (
            <section aria-labelledby="documentacao">
              <h2
                id="documentacao"
                className="mb-6 border-b border-hairline-subtle pb-4 font-mono text-[11px] uppercase tracking-wider text-text-subtle"
              >
                Documentação
              </h2>
              {hasToc && !isDesktop && (
                <details className="project-card group mb-8 rounded-xl">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-text [&::-webkit-details-marker]:hidden">
                    <span>
                      Nesta página
                      <span className="ml-2 font-mono text-xs text-text-subtle">{headings.length}</span>
                    </span>
                    <ChevronDown
                      className="size-4 text-text-subtle transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="border-t border-hairline-subtle px-4 py-3">
                    <ProjectToc headings={headings} showTitle={false} />
                  </div>
                </details>
              )}
              <MarkdownContent
                content={project.contentMarkdown || project.description}
                className="project-docs"
              />
            </section>
          )}
        </div>

        {/* Mobile: aparece antes da documentação; desktop: coluna lateral fixa */}
        <aside className="order-first space-y-8 lg:order-none lg:sticky lg:top-24">
          <ProjectInfo project={project} />
          {hasToc && isDesktop && <ProjectToc headings={headings} />}
        </aside>
      </div>
    </article>
  );
}
