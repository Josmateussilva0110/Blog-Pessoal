import { Link, useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/features/projects/components/StatusBadge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { formatDate } from "@/lib/format";
import { projectTransitionName } from "@/lib/viewTransition";

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(slug);
  const { isAuthenticated } = useAuth();
  const { closeProject } = useProjectTransition();

  function handleBack(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    closeProject(slug, () => {
      navigate("/#projetos");
    });
  }

  if (isLoading) {
    return (
      <div
        className="py-6 project-detail-vt"
        style={{ viewTransitionName: projectTransitionName(slug) }}
      >
        <div className="terminal-card p-8 animate-pulse">
          <div className="h-8 w-48 bg-surface-raised rounded mb-4" />
          <div className="h-4 w-full bg-surface-raised rounded" />
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
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-terminal/80" />
          <span className="font-mono text-[11px] ml-2 truncate">
            <span className="text-terminal">mateus@dev</span>
            <span className="text-text-subtle">:</span>
            <span className="text-accent">~/{project.slug}</span>
          </span>
        </div>

        <div className="p-6 md:p-8 lg:p-10">
          <header className="mb-8 pb-8 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={project.status} />
              <span className="font-mono text-xs text-text-subtle">
                {formatDate(project.updatedAt)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text">{project.title}</h1>
            {project.description && (
              <p className="mt-3 text-sm leading-relaxed text-text-muted max-w-2xl">
                {project.description}
              </p>
            )}
          </header>

          <MarkdownContent
            content={project.contentMarkdown || project.description}
            className="mb-8"
          />

          {project.images.length > 0 && (
            <div className="mb-8">
              <p className="code-comment mb-3">// images</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {project.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Captura de ${project.title}`}
                    className="w-full rounded-lg border border-border-subtle object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <p className="code-comment mb-3">// stack</p>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="accent">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAuthenticated && (
              <Link to={`/admin/projects/${project.id}/edit`}>
                <Button variant="outline" className="font-mono">
                  edit()
                </Button>
              </Link>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="font-mono">
                  github
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
