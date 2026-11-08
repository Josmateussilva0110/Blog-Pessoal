import { useState } from "react";
import { motion } from "motion/react";
import type { MonthUsage } from "@/features/projects/lib/projectStats";
import { cn } from "@/lib/format";
import { EASE_OUT, inViewRepeat } from "@/lib/motion";

/** Altura da coluna mais alta, em px */
const MAX_HEIGHT = 160;

/** Colunas de uma série: projetos cadastrados por mês, com os nomes do mês em foco */
export function ProjectsByMonthChart({ data }: { data: MonthUsage[] }) {
  const latest = data.at(-1);
  const [selectedKey, setSelectedKey] = useState(latest?.key);
  const current = data.find((month) => month.key === selectedKey) ?? latest;
  const max = Math.max(1, ...data.map((month) => month.projects.length));

  if (!current) return null;

  return (
    <figure className="home-card m-0 flex min-w-0 flex-col gap-5 p-5 sm:p-7">
      <figcaption>
        <span className="block text-xl font-semibold tracking-[-0.02em] text-home-ink">
          Projetos por mês
        </span>
        <span className="text-sm text-home-muted">Pela data de cadastro no portfólio.</span>
      </figcaption>

      <div className="flex min-h-60 flex-1 flex-col justify-end">
        <div className="flex h-[12.5rem] items-end gap-3 border-b border-home-line">
          {data.map((month, index) => {
            const active = month.key === current.key;
            const count = month.projects.length;
            const select = () => setSelectedKey(month.key);

            return (
              <button
                key={month.key}
                type="button"
                aria-pressed={active}
                aria-label={`${month.fullLabel}: ${count} ${count === 1 ? "projeto" : "projetos"}`}
                onClick={select}
                onMouseEnter={select}
                onFocus={select}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 rounded-t-md focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className="font-mono text-[13px] text-home-ink">{count}</span>
                <motion.span
                  className={cn(
                    "block w-full max-w-14 origin-bottom rounded-t transition-colors",
                    active ? "bg-brand" : "bg-home-ink",
                  )}
                  style={{ height: Math.round((count / max) * MAX_HEIGHT) }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={inViewRepeat}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: index * 0.06 }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 pt-2" aria-hidden>
          {data.map((month) => (
            <span key={month.key} className="flex-1 text-center text-[13px] text-home-muted">
              {month.label}
            </span>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="rounded-xl bg-home-inset px-4 py-3.5 text-sm text-home-body first-letter:uppercase">
        <strong className="text-home-ink">{current.fullLabel}</strong>: {current.projects.join(", ")}
      </p>
    </figure>
  );
}
