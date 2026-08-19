import type { Project } from "@blog/shared";
import { ProjectGrid } from "./ProjectGrid";

interface ProjectsSectionProps {
  projects?: Project[];
  isLoading: boolean;
}

export function ProjectsSection({ projects, isLoading }: ProjectsSectionProps) {
  const all = projects ?? [];
  const recentProjects = all.slice(0, 3);
  const remaining = all.slice(3);

  return (
    <section id="projetos" className="py-16 md:py-20 scroll-mt-28">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="code-comment mb-2">// projetos recentes</p>
          <h2 className="text-2xl md:text-3xl font-bold text-text tracking-tight">
            O que estou construindo
          </h2>
        </div>
        {all.length > 3 && (
          <a
            href="#projetos-todos"
            className="font-mono text-xs text-accent hover:text-accent-muted transition-colors shrink-0"
          >
            ver todos →
          </a>
        )}
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 terminal-card animate-pulse bg-surface-raised"
            />
          ))}
        </div>
      ) : (
        <ProjectGrid projects={recentProjects} columns={3} />
      )}

      {!isLoading && remaining.length > 0 && (
        <div id="projetos-todos" className="mt-16 scroll-mt-28">
          <p className="code-comment mb-6">// todos os projetos</p>
          <ProjectGrid projects={remaining} />
        </div>
      )}
    </section>
  );
}
