import { HeroSection } from "@/features/projects/components/HeroSection";
import { AboutSection } from "@/features/about/components/AboutSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { StackAnalyticsSection } from "@/features/projects/components/StackAnalyticsSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useRestoreProjectsScroll } from "@/hooks/useRestoreProjectsScroll";

export function HomePage() {
  const { data: projects, isLoading } = useProjects();
  useRestoreProjectsScroll();

  return (
    <>
      <HeroSection projectCount={projects?.length} />
      <AboutSection />
      <SkillsIconSection />
      <StackAnalyticsSection projects={projects ?? []} isLoading={isLoading} />
      <ProjectsSection projects={projects} isLoading={isLoading} />
    </>
  );
}
