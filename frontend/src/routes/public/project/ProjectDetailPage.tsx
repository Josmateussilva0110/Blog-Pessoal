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
        <div className="h-8 w-48 bg-surface-raised rounded animate-pulse mb-4" />
        <div className="h-4 w-full bg-surface-raised rounded animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-text-muted">Projeto não encontrado.</p>
        <Link to="/" className="text-accent text-sm mt-4 inline-block">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <article className="py-12 max-w-3xl">
      <Link
        to="/#projetos"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
      >
        ← projetos
      </Link>

      <header className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <StatusBadge status={project.status} />
          <span className="font-mono text-xs text-text-subtle">
            atualizado {formatDate(project.updatedAt)}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text">
          {project.title}
        </h1>
        <p className="text-lg text-text-muted mt-3">{project.summary}</p>
      </header>

      <div className="prose-custom text-text-muted leading-relaxed whitespace-pre-line mb-8">
        {project.description}
      </div>

      <div className="mb-8">
        <h2 className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
          Stack
        </h2>
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
            <Button>Ver ao vivo →</Button>
          </a>
        )}
      </div>
    </article>
  );
}
