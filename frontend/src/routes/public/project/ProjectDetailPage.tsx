import { Link, useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/features/projects/components/StatusBadge";
import { formatDate } from "@/lib/format";

export function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProject(slug);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="h-8 w-48 glass rounded-xl animate-pulse mb-4" />
        <div className="h-4 w-full glass rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center glass rounded-2xl">
        <p className="text-text-muted">Projeto não encontrado.</p>
        <Link to="/" className="text-accent text-sm mt-4 inline-block hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <article className="py-12">
      <Link
        to="/#projetos"
        className="text-sm text-text-muted hover:text-accent transition-colors"
      >
        ← Projetos
      </Link>

      <div className="glass-strong rounded-3xl p-8 md:p-10 mt-8 max-w-3xl">
        <header className="mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={project.status} />
            <span className="text-xs text-text-subtle">
              {formatDate(project.updatedAt)}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text">
            {project.title}
          </h1>
          <p className="text-lg text-text-muted mt-3 leading-relaxed">
            {project.summary}
          </p>
        </header>

        <div className="text-text-muted leading-relaxed whitespace-pre-line mb-8">
          {project.description}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-accent mb-3">Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="accent">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Repositório</Button>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button>Ver ao vivo</Button>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
