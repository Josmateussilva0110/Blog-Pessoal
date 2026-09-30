import type { Project } from "@blog/shared";
import { ArrowLeft, ArrowUpRight, ChevronDown, CodeXml, Pencil } from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { ProjectImageGallery } from "@/features/projects/components/ProjectImageGallery";
import { ProjectToc } from "@/features/projects/components/ProjectToc";
import { TERMINAL_STATUS } from "@/features/projects/lib/terminalStatus";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { SITE } from "@/config/constants";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatDate } from "@/lib/format";
import { extractHeadings } from "@/lib/markdownHeadings";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { getStatusLabel } from "@/lib/utils";
import { projectTransitionName, scrollToPageTop } from "@/lib/viewTransition";

const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2.5">
      <dt className="text-xs text-text-subtle lg:text-sm">{label}</dt>
      <dd className="text-text lg:text-right">{children}</dd>
    </div>
  );
}

/** Informações rápidas do projeto: status, plataforma, datas e stack */
function ProjectInfo({ project }: { project: Project }) {
  const status = normalizeProjectStatus(project.status);
  const platform = normalizeProjectPlatform(project.platform);

  return (
    <div className="project-card rounded-2xl p-5">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
        Sobre o projeto
      </p>
      <dl className="grid grid-cols-2 gap-x-4 lg:block lg:divide-y lg:divide-white/[0.06]">
        <InfoRow label="Status">
          <span className="inline-flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", TERMINAL_STATUS[status].stripe)} aria-hidden />
            {getStatusLabel(status)}
          </span>
        </InfoRow>
        <InfoRow label="Plataforma">{PLATFORM_LABELS[platform]}</InfoRow>
        <InfoRow label="Criado em">{formatDate(project.createdAt)}</InfoRow>
        <InfoRow label="Atualizado em">{formatDate(project.updatedAt)}</InfoRow>
      </dl>

      {project.techStack.length > 0 && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="mb-2.5 text-sm text-text-subtle">Stack</p>
          <ul className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();

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
      navigate("/", { state: { scrollTo: "projetos" } });
    });
  }

  if (isLoading) {
    return (
      <div
        className="py-6 project-detail-vt"
        style={{ viewTransitionName: projectTransitionName(slug) }}
      >
        <div className="animate-pulse">
          <div className="h-4 w-36 rounded bg-white/[0.05]" />
          <div className="mt-8 max-w-3xl space-y-4">
            <div className="h-3 w-56 rounded bg-white/[0.05]" />
            <div className="h-10 w-2/3 rounded bg-white/[0.06]" />
            <div className="h-4 w-full rounded bg-white/[0.05]" />
          </div>
          <div className="project-card mt-10 h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center terminal-card">
        <p className="text-text-muted">Projeto não encontrado.</p>
        <Link to="/" className="text-accent text-sm mt-4 inline-block hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const status = normalizeProjectStatus(project.status);
  const platform = normalizeProjectPlatform(project.platform);
  const hasDocs = Boolean(project.contentMarkdown || project.description);

  return (
    <article
      className="py-6 sm:py-8 project-detail-vt"
      style={{ viewTransitionName: projectTransitionName(slug) }}
    >
      <a
        href="/#projetos"
        onClick={handleBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        Voltar aos projetos
      </a>

      <header className="mt-8 mb-8 sm:mb-10 max-w-3xl">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
          <span className="inline-flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", TERMINAL_STATUS[status].stripe)} aria-hidden />
            {TERMINAL_STATUS[status].label}
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
                to={`/admin/projects/${project.id}/edit`}
                className={cn(actionClass, "border-white/10 text-text-muted hover:border-white/20 hover:text-text")}
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

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <div className="min-w-0">
          {hasDocs && (
            <section aria-labelledby="documentacao">
              <h2
                id="documentacao"
                className="mb-6 border-b border-white/[0.06] pb-4 font-mono text-[11px] uppercase tracking-wider text-text-subtle"
              >
                Documentação
              </h2>
              {headings.length > 1 && (
                <details className="project-card group mb-8 rounded-xl lg:hidden">
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
                  <div className="border-t border-white/[0.06] px-4 py-3">
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
          {headings.length > 1 && (
            <div className="hidden lg:block">
              <ProjectToc headings={headings} />
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
