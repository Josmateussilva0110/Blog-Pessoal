import type { Project } from "@blog/shared";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  title?: string;
  columns?: 2 | 3;
}

export function ProjectGrid({ projects, title, columns = 2 }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="font-mono text-sm text-text-muted">
        // nenhum projeto encontrado
      </p>
    );
  }

  const gridClass =
    columns === 3
      ? "grid gap-4 md:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2";

  return (
    <section>
      {title && (
        <h2 className="font-mono text-sm text-accent mb-6">{title}</h2>
      )}
      <div className={gridClass}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
