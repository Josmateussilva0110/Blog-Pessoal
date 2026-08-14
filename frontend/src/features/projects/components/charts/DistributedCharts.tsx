import type { Project } from "@blog/shared";
import { ChartPanel } from "./ChartPanel";
import { TechUsageBarChart } from "./TechUsageBarChart";
import { TechRadarChart } from "./TechRadarChart";

interface DistributedChartsProps {
  projects: Project[];
  variant: "hero" | "middle";
}

export function DistributedCharts({ projects, variant }: DistributedChartsProps) {
  if (variant === "hero") {
    return (
      <ChartPanel
        id="stack"
        label="Stack"
        title="Frequência por tecnologia"
        subtitle="Quantos projetos utilizam cada linguagem ou ferramenta."
      >
        <TechUsageBarChart projects={projects} />
      </ChartPanel>
    );
  }

  return (
    <ChartPanel
      className="py-6 md:py-10"
      label="Cobertura"
      title="Radar de habilidades"
      subtitle="Visão comparativa das tecnologias mais presentes."
    >
      <TechRadarChart projects={projects} />
    </ChartPanel>
  );
}

export function ChartsLoadingSkeleton({ variant }: { variant: DistributedChartsProps["variant"] }) {
  if (variant === "middle") {
    return (
      <div className="py-6 md:py-10">
        <div className="h-80 glass-strong rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14">
      <div className="h-72 glass-strong rounded-3xl animate-pulse" />
    </div>
  );
}
