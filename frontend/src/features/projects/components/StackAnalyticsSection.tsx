import type { Project } from "@blog/shared";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TerminalWindowBar } from "@/components/ui/TerminalWindow";
import { cn } from "@/lib/format";
import { TechUsageBarChart } from "./charts/TechUsageBarChart";
import { TechRadarChart } from "./charts/TechRadarChart";

interface StackAnalyticsSectionProps {
  projects: Project[];
  isLoading: boolean;
}

function ChartCard({
  path,
  title,
  children,
  className,
}: {
  path: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("terminal-card overflow-hidden", className)}>
      <TerminalWindowBar path={path} />
      <div className="p-5 md:p-7">
        <p className="code-comment mb-4">{title}</p>
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
          <div className="h-72 terminal-card animate-pulse bg-surface-raised" />
          <div className="h-80 max-w-sm mx-auto w-full terminal-card animate-pulse bg-surface-raised" />
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
        <ChartCard path="~/analytics/frequency.json" title="// frequência por tecnologia">
          <TechUsageBarChart projects={projects} />
        </ChartCard>

        <ChartCard
          path="~/analytics/radar.json"
          title="// radar de habilidades"
          className="max-w-md mx-auto w-full"
        >
          <TechRadarChart projects={projects} />
        </ChartCard>
      </div>
    </section>
  );
}
