import type { Project } from "@blog/shared";

export type TechCount = {
  name: string;
  count: number;
};

export const TECH_CHART_COLORS = [
  "#a5f3fc",
  "#67e8f9",
  "#22d3ee",
  "#06b6d4",
  "#0891b2",
  "#4ade80",
  "#34d399",
  "#14b8a6",
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
