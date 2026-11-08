import { ArrowLeft, ArrowUpRight, ChevronDown, CodeXml, Pencil } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { ProjectImageGallery } from "@/features/projects/components/ProjectImageGallery";
import { ProjectDetailSkeleton } from "@/features/projects/components/ProjectDetailSkeleton";
import { ProjectFacts } from "@/features/projects/components/ProjectFacts";
import { ProjectStackCard } from "@/features/projects/components/ProjectStackCard";
import { ProjectToc } from "@/features/projects/components/ProjectToc";
import { ProjectUpdates } from "@/features/projects/components/ProjectUpdates";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { DESKTOP_MEDIA_QUERY, SITE } from "@/config/constants";
import { ROUTES, SECTION_IDS } from "@/config/routes";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/format";
import { extractHeadings } from "@/lib/markdownHeadings";
import { normalizeProjectPlatform, PLATFORM_KIND_LABELS } from "@/lib/projectPlatform";
import { projectTransitionName, scrollToPageTop } from "@/lib/viewTransition";

const actionClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

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
      <div className="pt-4 sm:pt-6">
        <div className="home-card px-6 py-20 text-center">
          <p className="text-home-muted">Projeto não encontrado.</p>
          <Link
            to={ROUTES.home}
            className="mt-4 inline-block text-sm text-brand underline decoration-brand/40 underline-offset-[3px] hover:decoration-brand"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const platform = normalizeProjectPlatform(project.platform);
  const year = new Date(project.createdAt).getFullYear();
  const hasDocs = Boolean(project.contentMarkdown || project.description);
  // Um só índice montado por vez (cada um escuta o scroll)
  const hasToc = headings.length > 1;

  return (
    <article
      className="flex flex-col gap-3 pt-4 sm:pt-6 project-detail-vt"
      style={{ viewTransitionName: projectTransitionName(slug) }}
    >
      {/* Cabeçalho: voltar, título, ações e a faixa de dados */}
      <header className="home-card flex flex-col gap-8 p-6 sm:p-10">
        <a
          href={ROUTES.projectsSection}
          onClick={handleBack}
          className="group inline-flex min-h-10 items-center gap-1.5 self-start rounded-xl bg-home-inset px-3.5 text-sm text-home-muted transition-colors hover:bg-home-raised hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Todos os projetos
        </a>

        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="min-w-0 flex-[999_1_32rem]">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-home-muted">
              {PLATFORM_KIND_LABELS[platform]} · {year}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-home-ink sm:text-5xl lg:text-7xl">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-4 max-w-[36rem] text-base leading-relaxed text-home-body sm:text-lg">
                {project.description}
              </p>
            )}
          </div>

          {(project.repoUrl || isAuthenticated) && (
            <div className="flex flex-wrap gap-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(actionClass, "bg-home-ink text-home-device hover:bg-white")}
                >
                  <CodeXml className="size-4" aria-hidden />
                  Ver código
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </a>
              )}
              {isAuthenticated && (
                <Link
                  to={ROUTES.adminProjectEdit(project.id)}
                  className={cn(actionClass, "bg-home-inset text-home-ink hover:bg-home-raised")}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Link>
              )}
            </div>
          )}
        </div>

        <ProjectFacts project={project} />
      </header>

      {project.images.length > 0 && (
        <ProjectImageGallery
          images={project.images}
          projectTitle={project.title}
          platform={project.platform}
        />
      )}

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-3">
          {hasDocs && (
            <section aria-labelledby="documentacao" className="home-card p-5 sm:p-8 lg:p-10">
              <h2
                id="documentacao"
                className="mb-6 text-xl font-semibold tracking-[-0.02em] text-home-ink"
              >
                Documentação
              </h2>
              {hasToc && !isDesktop && (
                <details className="group mb-8 rounded-xl bg-home-inset">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm text-home-ink [&::-webkit-details-marker]:hidden">
                    <span>
                      Nesta página
                      <span className="ml-2 font-mono text-xs text-home-muted">{headings.length}</span>
                    </span>
                    <ChevronDown
                      className="size-4 text-home-muted transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="border-t border-home-line px-4 py-3">
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
          <ProjectUpdates updates={project.updates ?? []} projectSlug={project.slug} />
        </div>

        {/* Celular: a stack vem antes da documentação; desktop: coluna lateral com o índice fixo */}
        <aside className="order-first flex flex-col gap-3 lg:sticky lg:top-24 lg:order-none lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:thin]">
          <ProjectStackCard techStack={project.techStack} />
          {hasToc && isDesktop && (
            <div className="home-card p-5">
              <ProjectToc headings={headings} />
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
