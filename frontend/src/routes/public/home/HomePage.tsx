import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { HeroSection } from "@/features/projects/components/HeroSection";
import { ProjectGrid } from "@/features/projects/components/ProjectGrid";
import {
  ChartsLoadingSkeleton,
  DistributedCharts,
} from "@/features/projects/components/charts/DistributedCharts";
import { useProjects } from "@/features/projects/hooks/useProjects";

export function HomePage() {
  const { data: projects, isLoading } = useProjects();
  const hasProjects = !isLoading && projects && projects.length > 0;

  return (
    <>
      <HeroSection />

      {isLoading ? (
        <ChartsLoadingSkeleton variant="hero" />
      ) : (
        hasProjects && <DistributedCharts projects={projects} variant="hero" />
      )}

      <section id="projetos" className="py-16 md:py-20 scroll-mt-28">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Projetos</h2>
            <p className="text-sm text-text-muted mt-1">
              Apps, sites e experimentos.
            </p>
          </div>
          <span className="text-xs text-text-subtle hidden sm:block glass rounded-full px-3 py-1">
            {projects?.length ?? "—"} projetos
          </span>
        </div>

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

      {isLoading ? (
        <ChartsLoadingSkeleton variant="middle" />
      ) : (
        hasProjects && <DistributedCharts projects={projects} variant="middle" />
      )}

      <SkillsIconSection />

      <section id="sobre" className="py-16 md:py-20 scroll-mt-28">
        <div className="glass-strong rounded-3xl p-8 md:p-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-text mb-4">Sobre</h2>
          <p className="text-text-muted leading-relaxed">
            Desenvolvedor apaixonado por criar soluções com foco em
            experiência e código limpo. Cada projeto aqui traz stack, links e
            contexto técnico.
          </p>
        </div>
      </section>
    </>
  );
}
