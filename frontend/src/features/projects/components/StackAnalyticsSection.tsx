import type { Project } from "@blog/shared";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/format";
import { TechUsageBarChart } from "./charts/TechUsageBarChart";
import { TechRadarChart } from "./charts/TechRadarChart";

interface StackAnalyticsSectionProps {
  projects: Project[];
  isLoading: boolean;
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("glass-strong rounded-3xl overflow-hidden relative", className)}
    >
      <div className="chart-panel-shine" aria-hidden />
      <div className="relative p-5 md:p-7">
        <h3 className="text-sm font-semibold text-text mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function StackAnalyticsSection({
  projects,
  isLoading,
}: StackAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <section id="stack" className="py-16 md:py-20 scroll-mt-28">
        <SectionHeader
          tag="Analytics"
          title="Stack & Cobertura"
          subtitle="Dados reais extraídos dos projetos cadastrados."
        />
        <div className="flex flex-col gap-6">
          <div className="h-72 glass-strong rounded-3xl animate-pulse" />
          <div className="h-80 max-w-sm mx-auto w-full glass-strong rounded-3xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  return (
    <section id="stack" className="py-16 md:py-20 scroll-mt-28">
      <SectionHeader
        tag="Analytics"
        title="Stack & Cobertura"
        subtitle="Dados reais extraídos dos projetos cadastrados."
      />

      <div className="flex flex-col gap-6">
        <ChartCard title="Frequência por tecnologia">
          <TechUsageBarChart projects={projects} />
        </ChartCard>

        <ChartCard
          title="Radar de habilidades"
          className="max-w-md mx-auto w-full"
        >
          <TechRadarChart projects={projects} />
        </ChartCard>
      </div>
    </section>
  );
}
