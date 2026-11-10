import { ArrowLeft, ArrowUpRight, CodeXml, Pencil } from "lucide-react";
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
import { ProjectMobileToc } from "@/features/projects/components/ProjectMobileToc";
import { ProjectUpdates } from "@/features/projects/components/ProjectUpdates";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Button, buttonClassName } from "@/components/ui/Button";
import { MessageCard } from "@/components/ui/MessageCard";
import { BACK_LINK_CLASS, INLINE_LINK_CLASS } from "@/components/ui/linkStyles";
import { isSafeHref } from "@blog/shared/constants";
import { DESKTOP_MEDIA_QUERY, SITE } from "@/config/constants";
import { ROUTES, SECTION_IDS } from "@/config/routes";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { extractHeadings } from "@/lib/markdownHeadings";
import { normalizeProjectPlatform, PLATFORM_KIND_LABELS } from "@/lib/projectPlatform";
import { projectTransitionName, scrollToPageTop } from "@/lib/viewTransition";

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isPending, isError, isRefetching, refetch } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  const headings = useMemo(
    () => extractHeadings(project?.contentMarkdown ?? ""),
    [project?.contentMarkdown],
  );

  usePageMeta(
    project
      ? {
          title: `${project.title} — ${SITE.name}`,
          description: project.description || undefined,
          image: getProjectCover(project)?.original,
        }
      : null,
  );

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

  // isPending (não isLoading): com a nova tentativa pausada (aba oculta, sem rede) ainda não
  // há dado nem erro, e não dá para concluir que o projeto não existe
  if (isPending) {
    return <ProjectDetailSkeleton slug={slug} />;
  }

  if (!project) {
    if (isError) {
      return (
        <MessageCard tone="error" message="Não foi possível carregar o projeto.">
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isRefetching}>
            Tentar novamente
          </Button>
          <Link to={ROUTES.home} className={INLINE_LINK_CLASS}>
            Voltar ao início
          </Link>
        </MessageCard>
      );
    }

    return (
      <MessageCard message="Projeto não encontrado.">
        <Link to={ROUTES.home} className={INLINE_LINK_CLASS}>
          Voltar ao início
        </Link>
      </MessageCard>
    );
  }

  const platform = normalizeProjectPlatform(project.platform);
  // Defesa extra: o link vai direto para <a href>
  const repoUrl = isSafeHref(project.repoUrl) ? project.repoUrl : undefined;
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
          className={BACK_LINK_CLASS}
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Todos os projetos
        </a>

        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="min-w-0 flex-[999_1_32rem]">
            <p className="font-mono text-xs uppercase tracking-eyebrow text-home-muted">
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

          {(repoUrl || isAuthenticated) && (
            <div className="flex flex-wrap gap-2">
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClassName({ size: "cta" })}
                >
                  <CodeXml className="size-4" aria-hidden />
                  Ver código
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </a>
              )}
              {isAuthenticated && (
                <Link
                  to={ROUTES.adminProjectEdit(project.id)}
                  className={buttonClassName({ size: "cta", variant: "secondary" })}
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
                className="mb-6 text-xl font-semibold tracking-heading text-home-ink"
              >
                Documentação
              </h2>
              {hasToc && !isDesktop && <ProjectMobileToc headings={headings} />}
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
