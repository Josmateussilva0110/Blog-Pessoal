import type { Project } from "@blog/shared";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectGrid } from "./ProjectGrid";

interface ProjectsSectionProps {
  projects?: Project[];
  isLoading: boolean;
}

export function ProjectsSection({ projects, isLoading }: ProjectsSectionProps) {
  return (
    <section id="projetos" className="py-16 md:py-20 scroll-mt-28">
      <SectionHeader
        tag="Portfolio"
        title="Projetos"
        subtitle="Apps, sites e experimentos."
        trailing={
          <span className="text-xs text-text-subtle hidden sm:block glass rounded-full px-3 py-1">
            {projects?.length ?? "—"} projetos
          </span>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 glass rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ProjectGrid projects={projects ?? []} />
      )}
    </section>
  );
}
