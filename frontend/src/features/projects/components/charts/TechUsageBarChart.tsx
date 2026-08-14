import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Project } from "@blog/shared";
import { CHART_AXIS, CHART_GRID, getTechChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";

export function TechUsageBarChart({ projects }: { projects: Project[] }) {
  const data = getTechChartData(projects);

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 220)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          stroke={CHART_GRID}
          horizontal={false}
        />
        <XAxis type="number" hide domain={[0, "dataMax + 0.5"]} />
        <YAxis
          type="category"
          dataKey="name"
          width={108}
          tick={CHART_AXIS}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgb(59 130 246 / 0.06)" }}
          content={<ChartTooltip valueLabel="projetos" />}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="percent"
            position="insideRight"
            formatter={(value) => `${value}%`}
            fill="#f8fafc"
            fontSize={11}
            fontWeight={600}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
