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

type TechUsageBarChartProps = {
  projects: Project[];
  expanded?: boolean;
};

export function TechUsageBarChart({ projects, expanded = false }: TechUsageBarChartProps) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const data = getTechChartData(projects);
  const compact = isNarrow && !expanded;
  const rowHeight = expanded ? 56 : compact ? 40 : 44;

  return (
    <div
      className="w-full min-w-0"
      style={{ height: Math.max(data.length * rowHeight, expanded ? 380 : compact ? 200 : 220) }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 4,
            right: expanded ? 56 : compact ? 28 : 48,
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
            width={expanded ? 132 : compact ? 64 : 108}
            tick={{
              ...CHART_AXIS,
              fontSize: expanded ? 12 : compact ? 9 : CHART_AXIS.fontSize,
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgb(59 130 246 / 0.06)" }}
            content={<ChartTooltip valueLabel="projetos" />}
          />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            maxBarSize={expanded ? 26 : compact ? 16 : 22}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="percent"
              position="insideRight"
              formatter={(value) => `${value}%`}
              fill="#f8fafc"
              fontSize={expanded ? 12 : compact ? 9 : 11}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
