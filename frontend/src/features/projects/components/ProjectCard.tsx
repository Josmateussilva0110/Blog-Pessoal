import { Link } from "react-router-dom";
import type { Project } from "@blog/shared";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projetos/${project.slug}`} className="block group">
      <Card hover className="h-full flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-subtle">
              {formatDate(project.updatedAt)}
            </span>
            <h3 className="text-lg font-semibold text-text group-hover:text-accent transition-colors">
              {project.title}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-sm text-text-muted leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 4 && (
            <Badge variant="muted">+{project.techStack.length - 4}</Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
