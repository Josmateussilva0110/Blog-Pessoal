import { lazy, Suspense, useMemo } from "react";
import { HeroSection } from "@/features/projects/components/HeroSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { ContactLinks } from "@/features/site-links/components/ContactLinks";
import { useHomeProjects } from "@/features/projects/hooks/useProjects";
import { useRestoreProjectsScroll } from "@/features/projects/hooks/useRestoreProjectsScroll";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const StackAnalyticsSection = lazy(() =>
  import("@/features/projects/components/StackAnalyticsSection").then((module) => ({
    default: module.StackAnalyticsSection,
  })),
);

function SectionFallback() {
  return <div className="home-card h-[30rem] animate-pulse" />;
}

export function HomePage() {
  const { data: home, isPending, isError, isRefetching, refetch } = useHomeProjects();
  // Lista completa para os gráficos e a contagem das ferramentas (destaque + restante)
  const projects = useMemo(() => (home ? [...home.spotlight, ...home.others] : []), [home]);
  useRestoreProjectsScroll();

  return (
    <div className="flex flex-col gap-3 pt-4 sm:pt-6">
      {/* Hero fica acima da dobra: sem entrada para não atrasar o LCP */}
      <ScrollReveal enter={false}>
        <HeroSection />
      </ScrollReveal>
      {/* Sem saída: o palco tem TiltCard, e 3D dentro do painel girando gera artefatos no Chrome */}
      <ScrollReveal exit={false}>
        <ProjectsSection
          home={home}
          isLoading={isPending}
          isError={isError}
          isRetrying={isRefetching}
          onRetry={() => void refetch()}
        />
      </ScrollReveal>
      <ScrollReveal>
        <Suspense fallback={<SectionFallback />}>
          <StackAnalyticsSection projects={projects} isLoading={isPending} />
        </Suspense>
      </ScrollReveal>
      {/* Contato no mesmo painel das ferramentas: sozinho no fim da página, o
          scroll acaba antes da entrada terminar e ele ficaria inclinado e apagado */}
      <ScrollReveal exit={false} className="flex flex-col gap-3">
        <SkillsIconSection projects={projects} />
        <ContactLinks />
      </ScrollReveal>
    </div>
  );
}
