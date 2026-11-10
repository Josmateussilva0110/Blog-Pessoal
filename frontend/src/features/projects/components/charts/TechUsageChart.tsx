import { useState } from "react";
import { m } from "motion/react";
import type { TechUsage } from "@/features/projects/lib/projectStats";
import { cn } from "@/lib/cn";
import { getSkillIconUrl } from "@/lib/skillicons";
import { EASE_OUT, inViewRepeat } from "@/lib/motion";

/** Mais que isso vira uma lista longa demais para o card */
const MAX_BARS = 10;

interface TechUsageChartProps {
  data: TechUsage[];
  total: number;
}

/** Barras horizontais de uma série: a barra em foco ganha o acento e mostra quais projetos usam a tecnologia */
export function TechUsageChart({ data, total }: TechUsageChartProps) {
  const bars = data.slice(0, MAX_BARS);
  const [selectedLabel, setSelectedLabel] = useState(bars[0]?.label);
  const current = bars.find((tech) => tech.label === selectedLabel) ?? bars[0];
  const max = bars[0]?.projects.length ?? 1;

  if (!current) return null;

  return (
    <figure className="home-card m-0 flex min-w-0 flex-col gap-5 p-5 sm:p-7">
      <figcaption>
        <span className="block text-xl font-semibold tracking-heading text-home-ink">
          Tecnologias mais usadas
        </span>
        <span className="text-sm text-home-muted">
          Em quantos dos {total} projetos cada uma aparece. Passe o mouse ou toque numa barra.
        </span>
      </figcaption>

      <ul className="flex flex-col gap-0.5">
        {bars.map((tech, index) => {
          const active = tech.label === current.label;
          const count = tech.projects.length;
          const select = () => setSelectedLabel(tech.label);

          return (
            <li key={tech.label}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${tech.label}: ${count} de ${total} projetos`}
                onClick={select}
                onMouseEnter={select}
                onFocus={select}
                className={cn(
                  "flex min-h-9 w-full items-center gap-3 rounded-lg px-2 py-1 text-home-ink transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                  active && "bg-home-inset",
                )}
              >
                <span className="flex w-[8.75rem] shrink-0 items-center gap-2.5 text-left text-sm">
                  {tech.icon && (
                    <img
                      src={getSkillIconUrl(tech.icon)}
                      alt=""
                      width={22}
                      height={22}
                      loading="lazy"
                      className="size-[1.375rem] rounded-md"
                    />
                  )}
                  <span className="truncate">{tech.label}</span>
                </span>
                <span className="flex h-3.5 flex-1 items-center">
                  <m.span
                    className={cn(
                      "block h-3 origin-left rounded-r transition-colors",
                      active ? "bg-brand" : "bg-home-ink",
                    )}
                    style={{ width: `${(count / max) * 100}%` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={inViewRepeat}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: index * 0.04 }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right font-mono text-caption">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="rounded-xl bg-home-inset px-4 py-3.5 text-sm text-home-body">
        <strong className="text-home-ink">{current.label}</strong> em {current.projects.length} de{" "}
        {total} projetos: {current.projects.join(", ")}
      </p>
    </figure>
  );
}
