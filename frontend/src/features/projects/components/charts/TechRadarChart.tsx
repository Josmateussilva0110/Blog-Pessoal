import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Project } from "@blog/shared";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CHART_GRID, getRadarChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";
import { cn } from "@/lib/format";

type TechRadarChartProps = {
  projects: Project[];
  expanded?: boolean;
};

export function TechRadarChart({ projects, expanded = false }: TechRadarChartProps) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const compact = isNarrow && !expanded;
  const data = getRadarChartData(projects, {
    labelMaxLength: expanded ? 24 : compact ? 8 : 12,
  });

  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0",
        expanded
          ? "aspect-square min-h-[min(72dvh,28rem)] max-w-[min(100%,28rem)] sm:max-w-[min(100%,32rem)]"
          : "aspect-square max-w-[220px] sm:max-w-[300px]",
      )}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
        <RadarChart
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={expanded ? "72%" : compact ? "58%" : "68%"}
        >
          <PolarGrid stroke={CHART_GRID} />
          <PolarAngleAxis
            dataKey="tech"
            tick={{
              fill: "#94a3b8",
              fontSize: expanded ? 12 : compact ? 8 : 10,
            }}
          />
          <Radar
            name="Projetos"
            dataKey="value"
            stroke="#60a5fa"
            fill="#3b82f6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip content={<ChartTooltip valueLabel="projetos" />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
