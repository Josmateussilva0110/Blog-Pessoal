import type { Project } from "@blog/shared";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  title?: string;
}

export function ProjectGrid({ projects, title }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="text-sm text-text-muted">Nenhum projeto encontrado.</p>;
  }

  return (
    <section>
      {title && (
        <h2 className="text-sm font-medium text-accent mb-6">{title}</h2>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
