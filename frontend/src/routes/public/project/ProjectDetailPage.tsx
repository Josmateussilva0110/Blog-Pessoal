import type { Project } from "@blog/shared";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { ProjectImageGallery } from "@/features/projects/components/ProjectImageGallery";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/features/projects/components/StatusBadge";
import { PlatformBadge } from "@/features/projects/components/PlatformBadge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { TerminalWindow, TerminalWindowBar } from "@/components/ui/TerminalWindow";
import { SITE } from "@/config/constants";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDate } from "@/lib/format";
import { projectTransitionName, scrollToPageTop } from "@/lib/viewTransition";

function MetaPanel({
  project,
  isAuthenticated,
}: {
  project: Project;
  isAuthenticated: boolean;
}) {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="terminal-card overflow-hidden">
        <TerminalWindowBar path="~/meta.json" />
        <div className="p-4 space-y-4 font-mono text-xs">
          <div>
            <p className="text-text-subtle mb-1">status</p>
            <StatusBadge status={project.status} />
          </div>

          <div>
            <p className="text-text-subtle mb-1">platform</p>
            <PlatformBadge platform={project.platform} />
          </div>

          <div>
            <p className="text-text-subtle mb-1">updated_at</p>
            <p className="text-text">{formatDate(project.updatedAt)}</p>
          </div>

          <div>
            <p className="text-text-subtle mb-1">created_at</p>
            <p className="text-text">{formatDate(project.createdAt)}</p>
          </div>

          {project.techStack.length > 0 && (
            <div>
              <p className="text-text-subtle mb-2">stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] text-accent/80 bg-accent-soft border border-accent/20 px-2 py-0.5 rounded"
                  >
                    --{tech.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(project.repoUrl || isAuthenticated) && (
            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full font-mono">
                    github
                  </Button>
                </a>
              )}
              {isAuthenticated && (
                <Link to={`/admin/projects/${project.id}/edit`}>
                  <Button variant="outline" className="w-full font-mono">
                    edit()
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();

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
        <div className="terminal-card overflow-hidden animate-pulse">
          <TerminalWindowBar path="~/loading..." />
          <div className="p-8 space-y-4">
            <div className="h-8 w-2/3 bg-surface-raised rounded" />
            <div className="h-4 w-full bg-surface-raised rounded" />
            <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-8 pt-4">
              <div className="h-48 bg-surface-raised rounded" />
              <div className="h-40 bg-surface-raised rounded hidden lg:block" />
            </div>
          </div>
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

  return (
    <article
      className="py-6 project-detail-vt"
      style={{ viewTransitionName: projectTransitionName(slug) }}
    >
      <a
        href="/#projetos"
        onClick={handleBack}
        className="font-mono text-sm text-text-muted hover:text-accent transition-colors"
      >
        ← close()
      </a>

      <div className="terminal-card overflow-hidden mt-6">
        <TerminalWindowBar path={`~/${project.slug}`} />

        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <header className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border-subtle">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <StatusBadge status={project.status} />
              <PlatformBadge platform={project.platform} />
              <span className="font-mono text-[10px] text-text-subtle uppercase tracking-wider">
                readme.md
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text tracking-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-text-muted max-w-3xl">
                {project.description}
              </p>
            )}
          </header>

          <div className="space-y-8 sm:space-y-10">
            <div
              className={
                project.images.length > 0
                  ? "grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10 items-start"
                  : "grid lg:grid-cols-[240px] lg:justify-end gap-6 sm:gap-8 lg:gap-10 items-start"
              }
            >
              {project.images.length > 0 && (
                <ProjectImageGallery
                  images={project.images}
                  projectTitle={project.title}
                />
              )}
              <MetaPanel project={project} isAuthenticated={isAuthenticated} />
            </div>

            <section>
              <p className="code-comment mb-4">// documentação</p>
              <TerminalWindow path={`~/${project.slug}/readme.md`} bodyClassName="p-4 sm:p-5 md:p-6">
                <MarkdownContent
                  content={project.contentMarkdown || project.description}
                />
              </TerminalWindow>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
