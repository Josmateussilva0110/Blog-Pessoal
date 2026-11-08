import type { Project } from "@blog/shared";
import { getTechMeta } from "@/lib/skillicons";

export type TechUsage = {
  label: string;
  icon?: string;
  /** Títulos dos projetos que usam a tecnologia */
  projects: string[];
};

export type MonthUsage = {
  key: string;
  /** Mês abreviado para o eixo ("ago") */
  label: string;
  /** Mês por extenso para o detalhe ("agosto de 2026") */
  fullLabel: string;
  projects: string[];
};

/** Quantos meses o gráfico mostra no máximo (os mais recentes) */
const MAX_MONTHS = 6;

/** Tecnologias agrupadas pelo nome padronizado, da mais usada para a menos usada */
export function countTechUsage(projects: Project[]): TechUsage[] {
  const byLabel = new Map<string, TechUsage>();

  for (const project of projects) {
    for (const tech of project.techStack) {
      const meta = getTechMeta(tech);
      const entry = byLabel.get(meta.label) ?? { label: meta.label, icon: meta.icon, projects: [] };
      // Mesma tecnologia escrita duas vezes no projeto conta uma vez só
      if (!entry.projects.includes(project.title)) entry.projects.push(project.title);
      byLabel.set(meta.label, entry);
    }
  }

  return [...byLabel.values()].sort(
    (a, b) => b.projects.length - a.projects.length || a.label.localeCompare(b.label, "pt-BR"),
  );
}

/** Projetos agrupados pelo mês de cadastro no portfólio, em ordem cronológica */
export function countProjectsByMonth(projects: Project[]): MonthUsage[] {
  const short = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const long = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  const byMonth = new Map<string, MonthUsage>();

  for (const project of projects) {
    const date = new Date(project.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? {
      key,
      label: short.format(date).replace(".", ""),
      fullLabel: long.format(date),
      projects: [],
    };
    entry.projects.push(project.title);
    byMonth.set(key, entry);
  }

  return [...byMonth.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-MAX_MONTHS);
}
