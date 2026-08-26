import type { ProjectPlatform } from "@blog/shared";

export const PLATFORM_LABELS: Record<ProjectPlatform, string> = {
  mobile: "Mobile",
  web: "Web",
};

export const PLATFORM_TERMINAL_LABELS: Record<ProjectPlatform, string> = {
  mobile: "--mobile",
  web: "--web",
};

export function normalizeProjectPlatform(value: unknown): ProjectPlatform {
  return value === "mobile" ? "mobile" : "web";
}
