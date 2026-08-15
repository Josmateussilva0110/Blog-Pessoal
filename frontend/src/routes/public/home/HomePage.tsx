import { HeroSection } from "@/features/projects/components/HeroSection";
import { AboutSection } from "@/features/about/components/AboutSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { StackAnalyticsSection } from "@/features/projects/components/StackAnalyticsSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { useProjects } from "@/features/projects/hooks/useProjects";

export function HomePage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsIconSection />
      <StackAnalyticsSection projects={projects ?? []} isLoading={isLoading} />
      <ProjectsSection projects={projects} isLoading={isLoading} />
      <ScrollToTopButton threshold={0.7} />
    </>
  );
}
