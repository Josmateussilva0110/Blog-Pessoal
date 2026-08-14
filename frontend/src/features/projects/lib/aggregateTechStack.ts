import type { Project } from "@blog/shared";

export type TechCount = {
  name: string;
  count: number;
};

export const TECH_CHART_COLORS = [
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
] as const;

export function aggregateTechStack(projects: Project[]): TechCount[] {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const tech of project.techStack) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTechColor(index: number): string {
  return TECH_CHART_COLORS[index % TECH_CHART_COLORS.length];
}
