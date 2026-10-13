import type { ProjectUpdate } from "@blog/shared";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { SITE } from "@/config/constants";
import { ROUTES } from "@/config/routes";
import { ProjectToc } from "@/features/projects/components/ProjectToc";
import { ProjectUpdateMeta } from "@/features/projects/components/ProjectUpdates";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/format";
import { extractHeadings } from "@/lib/markdownHeadings";
import { scrollToPageTop } from "@/lib/viewTransition";

/** Breakpoint lg: a partir dele o índice fica na coluna lateral */
const DESKTOP_QUERY = "(min-width: 1024px)";

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
        "project-card group flex flex-col gap-1 rounded-xl px-4 py-3 transition-colors hover:border-accent/40",
        isNewer && "sm:col-start-2 sm:text-right",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-subtle",
          isNewer && "sm:justify-end",
        )}
      >
        {!isNewer && <ArrowLeft className="size-3.5" aria-hidden />}
        {isNewer ? "Mais recente" : "Mais antiga"}
        {isNewer && <ArrowRight className="size-3.5" aria-hidden />}
      </span>
      <span className="text-sm font-medium text-text transition-colors group-hover:text-accent">
        {update.version ? `${update.version} · ` : ""}
        {update.title}
      </span>
    </Link>
  );
}

/** Página própria de uma atualização longa, com índice dos seus títulos */
export function ProjectUpdatePage() {
  const { slug = "", updateId = "" } = useParams<{ slug: string; updateId: string }>();
  const { data: project, isLoading, isPlaceholderData } = useProject(slug);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

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

  useDocumentTitle(update && project ? `${update.title} — ${project.title} — ${SITE.name}` : null);

  useEffect(() => {
    scrollToPageTop("instant");
  }, [updateId]);

  // Dados vindos da home ainda não têm as atualizações: espera a resposta do detalhe
  if (isLoading || (isPlaceholderData && !update)) {
    return (
      <div className="animate-pulse py-6 sm:py-8">
        <div className="h-4 w-36 rounded bg-surface-muted" />
        <div className="mt-8 max-w-3xl space-y-4">
          <div className="h-3 w-40 rounded bg-surface-muted" />
          <div className="h-10 w-2/3 rounded bg-surface-muted" />
        </div>
        <div className="mt-10 space-y-3">
          <div className="h-4 w-full rounded bg-surface-muted" />
          <div className="h-4 w-5/6 rounded bg-surface-muted" />
          <div className="h-4 w-4/6 rounded bg-surface-muted" />
        </div>
      </div>
    );
  }

  if (!project || !update) {
    return (
      <div className="py-20 text-center terminal-card">
        <p className="text-text-muted">Atualização não encontrada.</p>
        <Link
          to={project ? ROUTES.project(project.slug) : ROUTES.home}
          className="text-accent text-sm mt-4 inline-block hover:underline"
        >
          {project ? "Voltar ao projeto" : "Voltar ao início"}
        </Link>
      </div>
    );
  }

  return (
    <article className="py-6 sm:py-8">
      <Link
        to={ROUTES.project(project.slug)}
        className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        Voltar a {project.title}
      </Link>

      <header className="mt-8 mb-8 sm:mb-10 max-w-3xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
          Atualização do projeto
        </p>
        <ProjectUpdateMeta update={update} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {update.title}
        </h1>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 xl:gap-16">
        <div className="min-w-0">
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

          <MarkdownContent content={update.contentMarkdown} className="project-docs" />

          {(older || newer) && (
            <nav
              aria-label="Outras atualizações"
              className="mt-16 grid gap-3 border-t border-hairline-subtle pt-8 sm:grid-cols-2"
            >
              {older && <UpdateNavLink slug={project.slug} update={older} direction="older" />}
              {newer && <UpdateNavLink slug={project.slug} update={newer} direction="newer" />}
            </nav>
          )}
        </div>

        {hasToc && isDesktop && (
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain">
            <ProjectToc headings={headings} />
          </aside>
        )}
      </div>
    </article>
  );
}
