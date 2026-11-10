import { SKILLICONS_THEME } from "@/config/skills";

const BASE_URL = "https://skillicons.dev/icons";

export function getSkillIconUrl(icon: string): string {
  return `${BASE_URL}?i=${encodeURIComponent(icon)}&theme=${SKILLICONS_THEME}`;
}

export type TechMeta = {
  /** Nome exibido, com a grafia oficial */
  label: string;
  /** Slug do ícone em https://skillicons.dev (ausente quando não há ícone) */
  icon?: string;
};

/**
 * Tecnologias cadastradas nos projetos vêm com grafias livres ("node.js",
 * "react-native", "PostgreSQL"). A chave aqui é o nome em minúsculas. Map (não objeto):
 * um projeto com a tecnologia "constructor" não pode cair nas chaves herdadas do Object.
 */
const KNOWN_TECH = new Map<string, TechMeta>(Object.entries({
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
}));

/** Recebe o nome escrito no projeto e devolve o nome padronizado e o ícone */
export type TechResolver = (name: string) => TechMeta;

/** Skill cadastrada no admin (site_links): só o que importa para reconhecer a tecnologia */
type TechSource = { label: string; icon?: string };

/**
 * Primeiro o KNOWN_TECH (junta as grafias livres); depois as skills do admin, pelo nome ou
 * pelo slug do ícone. Assim uma ferramenta nova cadastrada no admin ganha ícone e contagem
 * nos projetos sem precisar editar este arquivo. Desconhecidas mantêm o nome original sem ícone.
 */
export function createTechResolver(skills: TechSource[] = []): TechResolver {
  const fromSkills = new Map<string, TechMeta>();

  for (const skill of skills) {
    const label = skill.label.trim();
    const icon = skill.icon?.trim() || undefined;
    // Skill com grafia própria mas ícone já conhecido (label "Node", ícone "nodejs"): vira a
    // mesma tecnologia do KNOWN_TECH, senão os projetos com "node.js" não contariam para ela.
    // Busca pela chave, não pelo ícone: "react" é ícone de React e de React Native.
    const meta =
      KNOWN_TECH.get(label.toLowerCase()) ??
      (icon ? KNOWN_TECH.get(icon.toLowerCase()) : undefined) ??
      { label, icon };
    for (const key of [skill.label, skill.icon]) {
      const normalized = key?.trim().toLowerCase();
      if (normalized && !fromSkills.has(normalized)) fromSkills.set(normalized, meta);
    }
  }

  return (name) => {
    const key = name.trim().toLowerCase();
    return KNOWN_TECH.get(key) ?? fromSkills.get(key) ?? { label: name.trim() };
  };
}
