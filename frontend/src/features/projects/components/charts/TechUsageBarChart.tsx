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
import { CHART_AXIS, CHART_GRID, getBarLabelFill, getTechChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";

type TechUsageBarChartProps = {
  projects: Project[];
  expanded?: boolean;
};

type BarPercentLabelProps = {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number | null;
  payload?: { fill?: string };
  fontSize?: number;
};

function BarPercentLabel(props: BarPercentLabelProps) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const value = props.value;
  const fontSize = props.fontSize ?? 11;
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue) || width < 28) return null;

  const barColor = props.payload?.fill ?? "#2563eb";
  const labelFill = getBarLabelFill(barColor);
  const stroke = labelFill === "#f8fafc" ? "rgba(15, 23, 42, 0.55)" : "rgba(248, 250, 252, 0.7)";

  return (
    <text
      x={x + width - 8}
      y={y + height / 2}
      fill={labelFill}
      stroke={stroke}
      strokeWidth={2}
      paintOrder="stroke"
      textAnchor="end"
      dominantBaseline="middle"
      fontSize={fontSize}
      fontWeight={600}
    >
      {numericValue}%
    </text>
  );
}

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
              content={(props) => (
                <BarPercentLabel
                  {...(props as BarPercentLabelProps)}
                  fontSize={expanded ? 12 : compact ? 9 : 11}
                />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
