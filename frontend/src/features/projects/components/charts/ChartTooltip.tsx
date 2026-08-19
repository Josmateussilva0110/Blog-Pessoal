interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  valueLabel?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "valor",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 border border-accent/20 shadow-lg shadow-accent/10">
      <p className="text-xs text-text-muted mb-0.5">{label ?? item.name}</p>
      <p className="text-sm font-semibold text-text tabular-nums">
        {item.value} {valueLabel}
      </p>
    </div>
  );
}
