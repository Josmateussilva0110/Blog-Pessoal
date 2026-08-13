import { HeroSection } from "@/features/projects/components/HeroSection";
import { ProjectGrid } from "@/features/projects/components/ProjectGrid";
import { useProjects } from "@/features/projects/hooks/useProjects";

export function HomePage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <>
      <HeroSection />

      <section id="projetos" className="py-16 scroll-mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Projetos</h2>
            <p className="text-sm text-text-muted mt-1">
              Apps, sites e experimentos em código.
            </p>
          </div>
          <span className="font-mono text-xs text-text-subtle hidden sm:block">
            {projects?.length ?? "—"} projetos
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-lg border border-border-subtle bg-surface-raised animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ProjectGrid projects={projects ?? []} />
        )}
      </section>

      <section id="sobre" className="py-16 scroll-mt-20 border-t border-border-subtle">
        <h2 className="text-2xl font-bold text-text mb-4">Sobre</h2>
        <div className="max-w-2xl">
          <p className="text-text-muted leading-relaxed">
            Desenvolvedor apaixonado por criar produtos digitais com foco em
            experiência do usuário e código limpo. Este blog serve como vitrine
            dos meus projetos — cada um documentado como um README do GitHub,
            com stack, links e contexto técnico.
          </p>
          <div className="mt-6 font-mono text-sm text-text-subtle">
            <p>stack principal:</p>
            <p className="text-accent mt-1">
              react · typescript · node · supabase
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
