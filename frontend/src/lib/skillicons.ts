import { SKILLICONS_THEME } from "@/config/skills";

const BASE_URL = "https://skillicons.dev/icons";

export function getSkillIconUrl(icon: string): string {
  return `${BASE_URL}?i=${icon}&theme=${SKILLICONS_THEME}`;
}

export function getSkillsBannerUrl(icons: string[], perLine = 8): string {
  return `${BASE_URL}?i=${icons.join(",")}&theme=${SKILLICONS_THEME}&perline=${perLine}`;
}
