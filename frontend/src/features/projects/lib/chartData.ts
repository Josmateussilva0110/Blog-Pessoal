import type { Project } from "@blog/shared";
import { aggregateTechStack, getTechColor } from "./aggregateTechStack";

export function getTechChartData(projects: Project[]) {
  const items = aggregateTechStack(projects);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return items.map((item, index) => ({
    ...item,
    fill: getTechColor(index),
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}

export function getRadarChartData(projects: Project[]) {
  const techData = aggregateTechStack(projects);
  const max = techData[0]?.count ?? 1;

  return techData.slice(0, 6).map((item) => ({
    tech: item.name.length > 12 ? `${item.name.slice(0, 12)}…` : item.name,
    value: item.count,
    fullMark: max,
  }));
}

export const CHART_AXIS = { fill: "#64748b", fontSize: 11 };
export const CHART_GRID = "rgb(96 165 250 / 0.1)";
