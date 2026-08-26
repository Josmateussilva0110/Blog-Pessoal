import type { Project } from "@blog/shared";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getPlatformChartData } from "../../lib/chartData";
import { ChartTooltip } from "./ChartTooltip";

type PlatformPieChartProps = {
  projects: Project[];
  expanded?: boolean;
};

type PieSliceLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  payload?: { percent?: number };
  fontSize?: number;
};

function PieSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
  payload,
  fontSize = 11,
}: PieSliceLabelProps) {
  if (percent < 0.04) return null;

  const labelPercent = payload?.percent ?? Math.round(percent * 100);
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const angle = -midAngle * (Math.PI / 180);
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);

  return (
    <text
      x={x}
      y={y}
      fill="#f8fafc"
      stroke="rgba(15, 23, 42, 0.55)"
      strokeWidth={2}
      paintOrder="stroke"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={700}
    >
      {labelPercent}%
    </text>
  );
}

export function PlatformPieChart({ projects, expanded = false }: PlatformPieChartProps) {
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const compact = isNarrow && !expanded;
  const data = getPlatformChartData(projects);
  const labelFontSize = expanded ? 13 : compact ? 9 : 11;

  if (data.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-sm text-text-muted">
        // sem dados de plataforma
      </p>
    );
  }

  return (
    <div
      className="mx-auto w-full min-w-0"
      style={{ height: expanded ? 360 : compact ? 220 : 260 }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={expanded ? 72 : compact ? 44 : 56}
            outerRadius={expanded ? 112 : compact ? 68 : 84}
            paddingAngle={2}
            stroke="transparent"
            label={(props) => <PieSliceLabel {...props} fontSize={labelFontSize} />}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip valueLabel="projetos" />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="font-mono text-[11px] text-text-muted">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
