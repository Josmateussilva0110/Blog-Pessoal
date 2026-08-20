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

export function TechRadarChart({ projects }: { projects: Project[] }) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const data = getRadarChartData(projects);

  return (
    <div className="mx-auto w-full max-w-[260px] sm:max-w-[300px] aspect-square">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius={isNarrow ? "62%" : "68%"}>
          <PolarGrid stroke={CHART_GRID} />
          <PolarAngleAxis
            dataKey="tech"
            tick={{ fill: "#94a3b8", fontSize: isNarrow ? 9 : 10 }}
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
