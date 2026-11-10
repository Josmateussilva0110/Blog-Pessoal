import { useState } from "react";
import { m } from "motion/react";
import type { TechUsage } from "@/features/projects/lib/projectStats";
import { cn } from "@/lib/cn";
import { EASE_OUT, inViewRepeat } from "@/lib/motion";

/** Mais eixos que isso vira um polígono ilegível */
const MAX_AXES = 6;
/** Menos que isso não forma um radar (vira linha) */
const MIN_AXES = 3;

// Largura sobrando dos lados para os rótulos dos eixos laterais ("React Native")
const WIDTH = 440;
const HEIGHT = 300;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RADIUS = 100;
const RINGS = [0.25, 0.5, 0.75, 1];

function pointAt(index: number, total: number, scale: number) {
  const angle = (-90 + (index * 360) / total) * (Math.PI / 180);
  return { x: CX + Math.cos(angle) * RADIUS * scale, y: CY + Math.sin(angle) * RADIUS * scale };
}

function polygon(total: number, scaleOf: (index: number) => number) {
  return Array.from({ length: total }, (_, index) => {
    const { x, y } = pointAt(index, total, scaleOf(index));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

interface TechRadarChartProps {
  data: TechUsage[];
  total: number;
}

/** Radar de uma série: as tecnologias mais usadas, cada eixo vai até a mais frequente */
export function TechRadarChart({ data, total }: TechRadarChartProps) {
  const axes = data.slice(0, MAX_AXES);
  const [activeIndex, setActiveIndex] = useState(0);

  if (axes.length < MIN_AXES) return null;

  const max = axes[0].projects.length;
  const active = axes[activeIndex] ?? axes[0];
  const summary = axes.map((tech) => `${tech.label}: ${tech.projects.length}`).join(", ");

  return (
    <figure className="home-card m-0 flex min-w-0 flex-col gap-4 p-5 sm:p-7">
      <figcaption>
        <span className="block text-xl font-semibold tracking-heading text-home-ink">
          Radar de habilidades
        </span>
        <span className="text-sm text-home-muted">As {axes.length} tecnologias mais presentes nos projetos.</span>
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto w-full max-w-[30rem]"
        role="img"
        aria-label={`Radar de tecnologias, em quantos projetos cada uma aparece: ${summary}`}
      >
        {/* Grade recessiva: anéis e eixos finos */}
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={polygon(axes.length, () => ring)}
            className="fill-none stroke-home-line"
            strokeWidth={1}
          />
        ))}
        {axes.map((tech, index) => {
          const end = pointAt(index, axes.length, 1);
          return (
            <line key={tech.label} x1={CX} y1={CY} x2={end.x} y2={end.y} className="stroke-home-line" strokeWidth={1} />
          );
        })}

        {/* Série: cresce a partir do centro quando entra na tela */}
        <m.g
          style={{ transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={inViewRepeat}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <polygon
            points={polygon(axes.length, (index) => axes[index].projects.length / max)}
            className="fill-brand/20 stroke-brand"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {axes.map((tech, index) => {
            const point = pointAt(index, axes.length, tech.projects.length / max);
            const isActive = index === activeIndex;
            return (
              <g key={tech.label} onMouseEnter={() => setActiveIndex(index)}>
                {/* Área de toque maior que o ponto */}
                <circle cx={point.x} cy={point.y} r={16} className="fill-transparent" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 5 : 4}
                  className={cn(
                    "stroke-brand transition-[r] duration-200",
                    isActive ? "fill-brand" : "fill-home-card",
                  )}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </m.g>

        {/* Rótulos só com o nome; a quantidade aparece no detalhe abaixo do gráfico */}
        {axes.map((tech, index) => {
          const label = pointAt(index, axes.length, 1.2);
          const anchor = label.x > CX + 4 ? "start" : label.x < CX - 4 ? "end" : "middle";
          return (
            <text
              key={tech.label}
              x={label.x}
              y={label.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={cn(
                "text-caption transition-colors",
                index === activeIndex ? "fill-home-ink font-medium" : "fill-home-muted",
              )}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {tech.label}
            </text>
          );
        })}
      </svg>

      <p aria-live="polite" className="mt-auto rounded-xl bg-home-inset px-4 py-3.5 text-sm text-home-body">
        <strong className="text-home-ink">{active.label}</strong> em {active.projects.length} de {total} projetos
      </p>
    </figure>
  );
}
