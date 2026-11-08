import { SKILLICONS_THEME } from "@/config/skills";

const BASE_URL = "https://skillicons.dev/icons";

export function getSkillIconUrl(icon: string): string {
  return `${BASE_URL}?i=${icon}&theme=${SKILLICONS_THEME}`;
}

export function getSkillsBannerUrl(icons: string[], perLine = 8): string {
  return `${BASE_URL}?i=${icons.join(",")}&theme=${SKILLICONS_THEME}&perline=${perLine}`;
}

type TechMeta = {
  /** Nome exibido, com a grafia oficial */
  label: string;
  /** Slug do ícone em https://skillicons.dev (ausente quando não há ícone) */
  icon?: string;
};

/**
 * Tecnologias cadastradas nos projetos vêm com grafias livres ("node.js",
 * "react-native", "PostgreSQL"). A chave aqui é o nome em minúsculas.
 */
const KNOWN_TECH: Record<string, TechMeta> = {
  typescript: { label: "TypeScript", icon: "typescript" },
  javascript: { label: "JavaScript", icon: "javascript" },
  react: { label: "React", icon: "react" },
  "react-native": { label: "React Native", icon: "react" },
  "react native": { label: "React Native", icon: "react" },
  "node.js": { label: "Node.js", icon: "nodejs" },
  nodejs: { label: "Node.js", icon: "nodejs" },
  postgresql: { label: "PostgreSQL", icon: "postgres" },
  postgres: { label: "PostgreSQL", icon: "postgres" },
  mysql: { label: "MySQL", icon: "mysql" },
  sqlite: { label: "SQLite", icon: "sqlite" },
  supabase: { label: "Supabase", icon: "supabase" },
  docker: { label: "Docker", icon: "docker" },
  flutter: { label: "Flutter", icon: "flutter" },
  dart: { label: "Dart", icon: "dart" },
  python: { label: "Python", icon: "python" },
  express: { label: "Express", icon: "express" },
  vite: { label: "Vite", icon: "vite" },
  git: { label: "Git", icon: "git" },
  postman: { label: "Postman", icon: "postman" },
};

/** Nome padronizado e ícone de uma tecnologia; desconhecidas mantêm o nome original sem ícone */
export function getTechMeta(name: string): TechMeta {
  return KNOWN_TECH[name.trim().toLowerCase()] ?? { label: name.trim() };
}
