import type { ProjectPlatform } from "@blog/shared";

export const PLATFORM_LABELS: Record<ProjectPlatform, string> = {
  mobile: "Mobile",
  web: "Web",
};

/** Tipo do projeto por extenso, usado no explorador da home */
export const PLATFORM_KIND_LABELS: Record<ProjectPlatform, string> = {
  mobile: "App mobile",
  web: "Sistema web",
};

export const PLATFORM_TERMINAL_LABELS: Record<ProjectPlatform, string> = {
  mobile: "--mobile",
  web: "--web",
};

export function normalizeProjectPlatform(value: unknown): ProjectPlatform {
  return value === "mobile" ? "mobile" : "web";
}
