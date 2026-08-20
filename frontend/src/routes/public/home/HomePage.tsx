import { lazy, Suspense } from "react";
import { HeroSection } from "@/features/projects/components/HeroSection";
import { AboutSection } from "@/features/about/components/AboutSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useRestoreProjectsScroll } from "@/hooks/useRestoreProjectsScroll";
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
  const { data: projects, isLoading } = useProjects();
  useRestoreProjectsScroll();

  return (
    <>
      <HeroSection projectCount={projects?.length} isLoading={isLoading} />
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
      <ScrollReveal>
        <ProjectsSection projects={projects} isLoading={isLoading} />
      </ScrollReveal>
    </>
  );
}
