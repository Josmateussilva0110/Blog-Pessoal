import { useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import type { Project } from "@blog/shared";
import { ChartLightbox } from "@/components/ui/ChartLightbox";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TerminalWindowBar } from "@/components/ui/TerminalWindow";
import { cn } from "@/lib/format";
import { TechUsageBarChart } from "./charts/TechUsageBarChart";
import { TechRadarChart } from "./charts/TechRadarChart";

interface StackAnalyticsSectionProps {
  projects: Project[];
  isLoading: boolean;
}

function FullscreenButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent/35 bg-accent-soft px-2.5 py-1 font-mono text-[10px] text-accent transition-colors",
        "hover:border-accent/50 hover:bg-accent/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      )}
      onClick={onClick}
    >
      <Maximize2 className="size-3.5" aria-hidden />
      fullscreen()
    </button>
  );
}

function ChartCard({
  path,
  title,
  preview,
  fullscreen,
  className,
}: {
  path: string;
  title: string;
  preview: ReactNode;
  fullscreen: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={cn("terminal-card overflow-hidden", className)}>
        <TerminalWindowBar
          path={path}
          trailing={<FullscreenButton onClick={() => setOpen(true)} />}
        />
        <div className="p-4 sm:p-5 md:p-7">
          <p className="code-comment mb-4">{title}</p>
          <button
            type="button"
            className="w-full min-w-0 text-left md:cursor-default md:pointer-events-none"
            aria-label={`Ampliar gráfico: ${title}`}
            onClick={() => setOpen(true)}
          >
            {preview}
          </button>
        </div>
      </div>

      <ChartLightbox open={open} title={title} onClose={() => setOpen(false)}>
        {fullscreen}
      </ChartLightbox>
    </>
  );
}

export function StackAnalyticsSection({
  projects,
  isLoading,
}: StackAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <section id="stack" className="scroll-mt-24 py-12 sm:scroll-mt-28 sm:py-16 md:py-20">
        <SectionHeader
          tag="Analytics"
          title="Stack & Cobertura"
          subtitle="Dados reais extraídos dos projetos cadastrados."
        />
        <div className="flex flex-col gap-6">
          <div className="h-72 animate-pulse bg-surface-raised terminal-card" />
          <div className="mx-auto h-80 w-full max-w-sm animate-pulse bg-surface-raised terminal-card" />
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  return (
    <section id="stack" className="scroll-mt-24 py-12 sm:scroll-mt-28 sm:py-16 md:py-20">
      <SectionHeader
        tag="Analytics"
        title="Stack & Cobertura"
        subtitle="Dados reais extraídos dos projetos cadastrados."
      />

      <div className="flex flex-col gap-6">
        <ChartCard
          path="~/analytics/frequency.json"
          title="// frequência por tecnologia"
          preview={<TechUsageBarChart projects={projects} />}
          fullscreen={<TechUsageBarChart projects={projects} expanded />}
        />

        <ChartCard
          path="~/analytics/radar.json"
          title="// radar de habilidades"
          className="w-full md:mx-auto md:max-w-md"
          preview={<TechRadarChart projects={projects} />}
          fullscreen={<TechRadarChart projects={projects} expanded />}
        />
      </div>
    </section>
  );
}
