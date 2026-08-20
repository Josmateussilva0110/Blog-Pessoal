import type { Project } from "@blog/shared";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
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
    <section id="projetos" className="py-12 sm:py-16 md:py-20 scroll-mt-24 sm:scroll-mt-28">
      <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <p className="code-comment mb-2">// projetos recentes</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text tracking-tight">
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

      <TerminalWindow path="~/projects" bodyClassName="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8 sm:space-y-10">
        <p className="font-mono text-xs text-text-subtle -mt-2 mb-2">
          <span className="text-terminal">$ </span>
          <span className="text-accent">ls</span>
          <span className="text-text-muted"> --recent</span>
          {!isLoading && (
            <span className="text-text-subtle"> · {all.length} repos</span>
          )}
        </p>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 terminal-card-muted animate-pulse bg-surface-raised"
              />
            ))}
          </div>
        ) : (
          <ProjectGrid projects={recentProjects} columns={3} />
        )}

        {!isLoading && remaining.length > 0 && (
          <div id="projetos-todos" className="scroll-mt-24 sm:scroll-mt-28 pt-6 sm:pt-8 border-t border-border-subtle">
            <p className="code-comment mb-6">// todos os projetos</p>
            <ProjectGrid projects={remaining} />
          </div>
        )}
      </TerminalWindow>
    </section>
  );
}
