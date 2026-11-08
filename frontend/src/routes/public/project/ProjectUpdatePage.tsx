import type { ProjectUpdate } from "@blog/shared";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Button } from "@/components/ui/Button";
import { MessageCard } from "@/components/ui/MessageCard";
import { BACK_LINK_CLASS, INLINE_LINK_CLASS } from "@/components/ui/linkStyles";
import { DESKTOP_MEDIA_QUERY, SITE } from "@/config/constants";
import { ROUTES } from "@/config/routes";
import { ProjectToc } from "@/features/projects/components/ProjectToc";
import { ProjectMobileToc } from "@/features/projects/components/ProjectMobileToc";
import { ProjectUpdateMeta } from "@/features/projects/components/ProjectUpdates";
import { useProject } from "@/features/projects/hooks/useProjects";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { extractHeadings } from "@/lib/markdownHeadings";
import { scrollToPageTop } from "@/lib/viewTransition";

type UpdateNavLinkProps = {
  slug: string;
  update: ProjectUpdate;
  direction: "older" | "newer";
};

function UpdateNavLink({ slug, update, direction }: UpdateNavLinkProps) {
  const isNewer = direction === "newer";

  return (
    <Link
      to={ROUTES.projectUpdate(slug, update.id)}
      className={cn(
        "group flex flex-col gap-1 rounded-xl bg-home-inset px-4 py-3 transition-colors hover:bg-home-raised focus-visible:outline-2 focus-visible:outline-brand",
        isNewer && "sm:col-start-2 sm:text-right",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-home-muted",
          isNewer && "sm:justify-end",
        )}
      >
        {!isNewer && <ArrowLeft className="size-3.5" aria-hidden />}
        {isNewer ? "Mais recente" : "Mais antiga"}
        {isNewer && <ArrowRight className="size-3.5" aria-hidden />}
      </span>
      <span className="text-sm font-medium text-home-ink">
        {update.version ? `${update.version} · ` : ""}
        {update.title}
      </span>
    </Link>
  );
}

/** Página própria de uma atualização longa, com índice dos seus títulos */
export function ProjectUpdatePage() {
  const { slug = "", updateId = "" } = useParams<{ slug: string; updateId: string }>();
  const { data: project, isPending, isError, isPlaceholderData, isRefetching, refetch } =
    useProject(slug);
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  // Lista vem da mais recente para a mais antiga
  const updates = project?.updates ?? [];
  const index = updates.findIndex((update) => update.id === updateId);
  const update = index >= 0 ? updates[index] : undefined;
  const newer = index > 0 ? updates[index - 1] : undefined;
  const older = index >= 0 ? updates[index + 1] : undefined;

  const headings = useMemo(
    () => extractHeadings(update?.contentMarkdown ?? ""),
    [update?.contentMarkdown],
  );
  const hasToc = headings.length > 1;

  usePageMeta(
    update && project
      ? {
          title: `${update.title} — ${project.title} — ${SITE.name}`,
          description: `Atualização de ${project.title}${update.version ? ` (${update.version})` : ""}.`,
          image: getProjectCover(project)?.original,
        }
      : null,
  );

  useEffect(() => {
    scrollToPageTop("instant");
  }, [updateId]);

  // Dados vindos da home ainda não têm as atualizações: espera a resposta do detalhe
  if (isPending || (isPlaceholderData && !update)) {
    return (
      <div className="flex flex-col gap-3 pt-4 sm:pt-6">
        <span role="status" className="sr-only">
          Carregando atualização…
        </span>
        <div className="home-card animate-pulse space-y-4 p-6 sm:p-10" aria-hidden>
          <div className="h-9 w-40 rounded-xl bg-home-inset" />
          <div className="h-3 w-40 rounded bg-home-inset" />
          <div className="h-10 w-2/3 rounded-lg bg-home-inset" />
        </div>
        <div className="home-card animate-pulse space-y-3 p-6 sm:p-10" aria-hidden>
          <div className="h-4 w-full rounded bg-home-inset" />
          <div className="h-4 w-5/6 rounded bg-home-inset" />
          <div className="h-4 w-4/6 rounded bg-home-inset" />
        </div>
      </div>
    );
  }

  if (isError && !project) {
    return (
      <MessageCard tone="error" message="Não foi possível carregar a atualização.">
        <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isRefetching}>
          Tentar novamente
        </Button>
        <Link to={ROUTES.home} className={INLINE_LINK_CLASS}>
          Voltar ao início
        </Link>
      </MessageCard>
    );
  }

  if (!project || !update) {
    return (
      <MessageCard message="Atualização não encontrada.">
        <Link to={project ? ROUTES.project(project.slug) : ROUTES.home} className={INLINE_LINK_CLASS}>
          {project ? "Voltar ao projeto" : "Voltar ao início"}
        </Link>
      </MessageCard>
    );
  }

  return (
    <article className="flex flex-col gap-3 pt-4 sm:pt-6">
      <header className="home-card flex flex-col gap-8 p-6 sm:p-10">
        <Link
          to={ROUTES.project(project.slug)}
          className={BACK_LINK_CLASS}
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Voltar a {project.title}
        </Link>

        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-eyebrow text-home-muted">
            Atualização do projeto
          </p>
          <ProjectUpdateMeta update={update} />
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-home-ink sm:text-5xl">
            {update.title}
          </h1>
        </div>
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="home-card min-w-0 p-5 sm:p-8 lg:p-10">
          {hasToc && !isDesktop && <ProjectMobileToc headings={headings} />}

          <MarkdownContent content={update.contentMarkdown} className="project-docs" />

          {(older || newer) && (
            <nav
              aria-label="Outras atualizações"
              className="mt-12 grid gap-3 border-t border-home-line pt-8 sm:grid-cols-2"
            >
              {older && <UpdateNavLink slug={project.slug} update={older} direction="older" />}
              {newer && <UpdateNavLink slug={project.slug} update={newer} direction="newer" />}
            </nav>
          )}
        </div>

        {hasToc && isDesktop && (
          <aside className="home-card p-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
            <ProjectToc headings={headings} />
          </aside>
        )}
      </div>
    </article>
  );
}
