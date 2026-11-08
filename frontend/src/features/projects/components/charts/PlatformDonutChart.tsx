import { useState } from "react";
import { motion } from "motion/react";
import type { ProjectPlatform } from "@blog/shared";
import type { PlatformUsage } from "@/features/projects/lib/projectStats";
import { cn } from "@/lib/cn";
import { EASE_OUT, inViewRepeat } from "@/lib/motion";

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 72;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Espaço entre as fatias, na cor do fundo */
const GAP = 3;

/** Cor fixa por plataforma (não pela posição): filtrar não repinta as fatias */
const PLATFORM_COLOR: Record<ProjectPlatform, { stroke: string; swatch: string }> = {
  mobile: { stroke: "stroke-brand", swatch: "bg-brand" },
  web: { stroke: "stroke-home-body", swatch: "bg-home-body" },
};

/** Rosca com a divisão dos projetos por plataforma; a legenda seleciona a fatia */
export function PlatformDonutChart({ data, total }: { data: PlatformUsage[]; total: number }) {
  const [activePlatform, setActivePlatform] = useState(data[0]?.platform);
  const active = data.find((item) => item.platform === activePlatform) ?? data[0];

  if (!active) return null;

  const gap = data.length > 1 ? GAP : 0;
  let offset = 0;
  const slices = data.map((item) => {
    const length = (item.count / total) * CIRCUMFERENCE;
    const slice = { ...item, dash: Math.max(length - gap, 0), offset };
    offset += length;
    return slice;
  });

  return (
    <figure className="home-card m-0 flex min-w-0 flex-col gap-4 p-5 sm:p-7">
      <figcaption>
        <span className="block text-xl font-semibold tracking-heading text-home-ink">
          Distribuição por plataforma
        </span>
        <span className="text-sm text-home-muted">Quantos projetos são apps mobile e quantos são web.</span>
      </figcaption>

      <div className="relative mx-auto my-auto w-full max-w-[15rem]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full"
          role="img"
          aria-label={data.map((item) => `${item.label}: ${item.count} (${item.percent}%)`).join(", ")}
        >
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: `${CENTER}px ${CENTER}px` }}
            initial={{ rotate: -70, scale: 0.9, opacity: 0 }}
            whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
            viewport={inViewRepeat}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            {/* Começa no topo, sentido horário */}
            <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              {slices.map((slice) => (
                <circle
                  key={slice.platform}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeDasharray={`${slice.dash} ${CIRCUMFERENCE - slice.dash}`}
                  strokeDashoffset={-slice.offset}
                  className={cn(
                    PLATFORM_COLOR[slice.platform].stroke,
                    "transition-opacity duration-200",
                    slice.platform !== active.platform && "opacity-35",
                  )}
                  onMouseEnter={() => setActivePlatform(slice.platform)}
                />
              ))}
            </g>
          </motion.g>
        </svg>

        {/* Centro: a fatia em foco */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tracking-[-0.04em] text-home-ink">{active.percent}%</span>
          <span className="text-sm text-home-muted">
            {active.count} {active.label.toLowerCase()}
          </span>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-2" aria-label="Plataformas">
        {data.map((item) => {
          const isActive = item.platform === active.platform;
          const select = () => setActivePlatform(item.platform);
          return (
            <li key={item.platform}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={select}
                onMouseEnter={select}
                onFocus={select}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm text-home-ink transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                  isActive ? "bg-home-inset" : "hover:bg-home-inset/60",
                )}
              >
                <span aria-hidden className={cn("size-2.5 rounded-[3px]", PLATFORM_COLOR[item.platform].swatch)} />
                {item.label}
                <span className="font-mono text-xs text-home-muted">
                  {item.count} · {item.percent}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
