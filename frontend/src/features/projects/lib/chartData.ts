import type { Project } from "@blog/shared";
import { aggregateTechStack, getTechColor } from "./aggregateTechStack";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";

const PLATFORM_CHART_COLORS = {
  mobile: "#2563eb",
  web: "#059669",
} as const;

export function getTechChartData(projects: Project[]) {
  const items = aggregateTechStack(projects);
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const topItems = items.slice(0, 5);

  return topItems.map((item, index) => ({
    ...item,
    fill: getTechColor(index),
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}

export function getPlatformChartData(projects: Project[]) {
  const counts = { mobile: 0, web: 0 };

  for (const project of projects) {
    const platform = normalizeProjectPlatform(project.platform);
    counts[platform] += 1;
  }

  const total = projects.length;

  return (["mobile", "web"] as const)
    .map((platform) => ({
      name: platform === "mobile" ? "Mobile" : "Web",
      value: counts[platform],
      fill: PLATFORM_CHART_COLORS[platform],
      percent: total > 0 ? Math.round((counts[platform] / total) * 100) : 0,
    }))
    .filter((item) => item.value > 0);
}

export function getRadarChartData(projects: Project[], options?: { labelMaxLength?: number }) {
  const techData = aggregateTechStack(projects);
  const max = techData[0]?.count ?? 1;
  const labelMaxLength = options?.labelMaxLength ?? 12;

  return techData.slice(0, 6).map((item) => ({
    tech:
      item.name.length > labelMaxLength
        ? `${item.name.slice(0, labelMaxLength)}…`
        : item.name,
    value: item.count,
    fullMark: max,
  }));
}

export const CHART_AXIS = { fill: "#64748b", fontSize: 11 };
export const CHART_GRID = "rgb(34 211 238 / 0.1)";

function parseHexColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;

  return { r, g, b };
}

/** Pick label color that stays readable on the bar fill. */
export function getBarLabelFill(barColor: string): string {
  const rgb = parseHexColor(barColor);
  if (!rgb) return "#f8fafc";

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.58 ? "#0f172a" : "#f8fafc";
}
