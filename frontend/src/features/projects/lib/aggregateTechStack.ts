import type { Project } from "@blog/shared";

export type TechCount = {
  name: string;
  count: number;
};

export const TECH_CHART_COLORS = [
  "#0284c7",
  "#0369a1",
  "#2563eb",
  "#1d4ed8",
  "#0891b2",
  "#0e7490",
  "#059669",
  "#0d9488",
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
