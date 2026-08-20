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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CHART_AXIS, CHART_GRID, getTechChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";

export function TechUsageBarChart({ projects }: { projects: Project[] }) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const data = getTechChartData(projects);
  const rowHeight = isNarrow ? 48 : 44;

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * rowHeight, 220)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 4,
          right: isNarrow ? 32 : 48,
          left: 0,
          bottom: 4,
        }}
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
          width={isNarrow ? 72 : 108}
          tick={{ ...CHART_AXIS, fontSize: isNarrow ? 10 : CHART_AXIS.fontSize }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgb(59 130 246 / 0.06)" }}
          content={<ChartTooltip valueLabel="projetos" />}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={isNarrow ? 18 : 22}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="percent"
            position="insideRight"
            formatter={(value) => `${value}%`}
            fill="#f8fafc"
            fontSize={isNarrow ? 10 : 11}
            fontWeight={600}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
