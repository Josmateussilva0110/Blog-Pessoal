import { lazy, Suspense, useMemo } from "react";
import { HeroSection } from "@/features/projects/components/HeroSection";
import { AboutSection } from "@/features/about/components/AboutSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { useHomeProjects } from "@/features/projects/hooks/useProjects";
import { useRestoreProjectsScroll } from "@/features/projects/hooks/useRestoreProjectsScroll";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const StackAnalyticsSection = lazy(() =>
  import("@/features/projects/components/StackAnalyticsSection").then((module) => ({
    default: module.StackAnalyticsSection,
  })),
);

function SectionFallback() {
  return (
    <div className="py-16 md:py-20">
      <div className="h-72 terminal-card animate-pulse bg-surface-raised" />
    </div>
  );
}

export function HomePage() {
  const { data: home, isLoading } = useHomeProjects();
  // Lista completa para contagem e gráficos (destaque + restante)
  const projects = useMemo(() => (home ? [...home.spotlight, ...home.others] : undefined), [home]);
  useRestoreProjectsScroll();

  return (
    <>
      {/* Hero fica acima da dobra: sem entrada para não atrasar o LCP */}
      <ScrollReveal enter={false}>
        <HeroSection projectCount={projects?.length} isLoading={isLoading} />
      </ScrollReveal>
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>
      <ScrollReveal>
        <SkillsIconSection />
      </ScrollReveal>
      <ScrollReveal>
        <Suspense fallback={<SectionFallback />}>
          <StackAnalyticsSection projects={projects ?? []} isLoading={isLoading} />
        </Suspense>
      </ScrollReveal>
      <ScrollReveal exit={false}>
        <ProjectsSection home={home} isLoading={isLoading} />
      </ScrollReveal>
    </>
  );
}
