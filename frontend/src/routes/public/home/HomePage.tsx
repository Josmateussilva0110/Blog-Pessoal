import { lazy, Suspense, useEffect, useMemo } from "react";
import { HeroSection } from "@/features/projects/components/HeroSection";
import { SkillsIconSection } from "@/features/skills/components/SkillsIconSection";
import { ProjectsSection } from "@/features/projects/components/ProjectsSection";
import { ContactLinks } from "@/features/site-links/components/ContactLinks";
import { useHomeProjects } from "@/features/projects/hooks/useProjects";
import { useRestoreProjectsScroll } from "@/features/projects/hooks/useRestoreProjectsScroll";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StackAnalyticsSkeleton } from "@/features/projects/components/StackAnalyticsSkeleton";
import { prefetchProjectDetailPageWhenIdle } from "@/routes/public/project/loadProjectDetailPage";

const StackAnalyticsSection = lazy(() =>
  import("@/features/projects/components/StackAnalyticsSection").then((module) => ({
    default: module.StackAnalyticsSection,
  })),
);

export function HomePage() {
  const { data: home, isPending, isError, isRefetching, refetch } = useHomeProjects();
  // Lista completa para os gráficos e a contagem das ferramentas (destaque + restante)
  const projects = useMemo(() => (home ? [...home.spotlight, ...home.others] : []), [home]);
  useRestoreProjectsScroll();

  // O clique num projeto é o próximo passo provável: a página dele já fica baixada
  useEffect(() => prefetchProjectDetailPageWhenIdle(), []);

  return (
    <div className="flex flex-col gap-3 pt-4 sm:pt-6">
      {/* Hero fica acima da dobra: sem entrada para não atrasar o LCP */}
      <ScrollReveal enter={false}>
        <HeroSection />
      </ScrollReveal>
      {/* Sem 3D: o palco tem prints (ver `flat`). Sem saída: o TiltCard girando
          dentro do painel inclinado gera artefatos no Chrome */}
      <ScrollReveal exit={false} flat>
        <ProjectsSection
          home={home}
          isLoading={isPending}
          isError={isError}
          isRetrying={isRefetching}
          onRetry={() => void refetch()}
        />
      </ScrollReveal>
      <ScrollReveal>
        <Suspense fallback={<StackAnalyticsSkeleton />}>
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
