import { useMemo } from "react";
import type { Project } from "@blog/shared";
import { ProjectsByMonthChart } from "./charts/ProjectsByMonthChart";
import { TechUsageChart } from "./charts/TechUsageChart";
import { TechRadarChart } from "./charts/TechRadarChart";
import { PlatformDonutChart } from "./charts/PlatformDonutChart";
import { countByPlatform, countProjectsByMonth, countTechUsage } from "@/features/projects/lib/projectStats";
import { SECTION_IDS } from "@/config/routes";

interface StackAnalyticsSectionProps {
  projects: Project[];
  isLoading: boolean;
}

export function StackAnalyticsSection({ projects, isLoading }: StackAnalyticsSectionProps) {
  const techUsage = useMemo(() => countTechUsage(projects), [projects]);
  const byMonth = useMemo(() => countProjectsByMonth(projects), [projects]);
  const byPlatform = useMemo(() => countByPlatform(projects), [projects]);

  if (isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-hidden>
        <div className="home-card h-[30rem] animate-pulse" />
        <div className="home-card h-[30rem] animate-pulse" />
      </div>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section id={SECTION_IDS.stack} aria-labelledby="stack-title" className="scroll-mt-24 sm:scroll-mt-28">
      <h2 id="stack-title" className="sr-only">
        Em números
      </h2>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TechUsageChart data={techUsage} total={projects.length} />
          <ProjectsByMonthChart data={byMonth} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TechRadarChart data={techUsage} total={projects.length} />
          <PlatformDonutChart data={byPlatform} total={projects.length} />
        </div>
      </div>
    </section>
  );
}
