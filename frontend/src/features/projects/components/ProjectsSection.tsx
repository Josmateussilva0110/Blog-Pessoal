import type { HomeProjects } from "@blog/shared";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
import { ProjectGrid } from "./ProjectGrid";
import { TypingCommand } from "@/components/ui/TypingText";
import { RevealText } from "@/components/ui/RevealText";
import { SECTION_IDS } from "@/config/routes";

interface ProjectsSectionProps {
  home?: HomeProjects;
  isLoading: boolean;
}

export function ProjectsSection({ home, isLoading }: ProjectsSectionProps) {
  const spotlight = home?.spotlight ?? [];
  const others = home?.others ?? [];
  const total = spotlight.length + others.length;
  const usesFeaturedSpotlight = home?.spotlightMode === "featured";

  return (
    <section id={SECTION_IDS.projects} className="py-12 sm:py-16 md:py-20 scroll-mt-24 sm:scroll-mt-28">
      <header className="mb-8 sm:mb-10">
        <p className="code-comment mb-2">
          {usesFeaturedSpotlight ? "// projetos em destaque" : "// projetos recentes"}
        </p>
        <RevealText
          text="O que estou construindo"
          className="text-xl sm:text-2xl md:text-3xl font-bold text-text tracking-tight"
        />
      </header>

      <TerminalWindow path="~/projects" bodyClassName="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8 sm:space-y-10">
        <TypingCommand
          className="font-mono text-xs text-text-subtle -mt-2 mb-2"
          command="ls"
          args={usesFeaturedSpotlight ? " --featured" : " --recent"}
          suffix={!isLoading && ` · ${total} repos`}
        />

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="project-card h-[26rem] animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <ProjectGrid projects={spotlight} size="large" />
        )}

        {!isLoading && others.length > 0 && (
          <div id="projetos-todos" className="scroll-mt-24 sm:scroll-mt-28 pt-6 sm:pt-8 border-t border-border-subtle">
            <p className="code-comment mb-6">// todos os projetos</p>
            <ProjectGrid projects={others} />
          </div>
        )}
      </TerminalWindow>
    </section>
  );
}
