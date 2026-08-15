import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Project } from "@blog/shared";
import { CHART_GRID, getRadarChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";

const RADAR_SIZE = 300;

export function TechRadarChart({ projects }: { projects: Project[] }) {
  const data = getRadarChartData(projects);

  return (
    <div
      className="mx-auto"
      style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke={CHART_GRID} />
          <PolarAngleAxis
            dataKey="tech"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
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
