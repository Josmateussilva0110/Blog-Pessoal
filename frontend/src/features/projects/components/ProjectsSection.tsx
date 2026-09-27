import type { Project } from "@blog/shared";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
import { getHomeProjectSections } from "@/features/projects/lib/homeProjects";
import { ProjectGrid } from "./ProjectGrid";
import { TypingCommand } from "@/components/ui/TypingText";

interface ProjectsSectionProps {
  projects?: Project[];
  isLoading: boolean;
}

export function ProjectsSection({ projects, isLoading }: ProjectsSectionProps) {
  const all = projects ?? [];
  const { spotlightProjects, remaining, usesFeaturedSpotlight } = getHomeProjectSections(all);

  return (
    <section id="projetos" className="py-12 sm:py-16 md:py-20 scroll-mt-24 sm:scroll-mt-28">
      <header className="mb-8 sm:mb-10">
        <p className="code-comment mb-2">
          {usesFeaturedSpotlight ? "// projetos em destaque" : "// projetos recentes"}
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text tracking-tight">
          O que estou construindo
        </h2>
      </header>

      <TerminalWindow path="~/projects" bodyClassName="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8 sm:space-y-10">
        <TypingCommand
          className="font-mono text-xs text-text-subtle -mt-2 mb-2"
          command="ls"
          args={usesFeaturedSpotlight ? " --featured" : " --recent"}
          suffix={!isLoading && ` · ${all.length} repos`}
        />

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="mx-auto aspect-[1/1.08] w-full max-w-[20rem] rounded-lg terminal-card-muted animate-pulse bg-surface-raised"
              />
            ))}
          </div>
        ) : (
          <ProjectGrid projects={spotlightProjects} columns={3} variant="floppy" />
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
