export type SkillItem = {
  /** Nome exibido abaixo do ícone */
  name: string;
  /** Slug do ícone em https://skillicons.dev */
  icon: string;
  /** Link opcional ao clicar no ícone */
  href?: string;
};

/**
 * Edite esta lista para alterar as linguagens e ferramentas exibidas na home.
 * Ícones disponíveis: https://skillicons.dev
 */
export const SKILLS: SkillItem[] = [
  { name: "Python", icon: "python" },
  { name: "Node.js", icon: "nodejs", href: "https://nodejs.org" },
  { name: "JavaScript", icon: "javascript" },
  { name: "TypeScript", icon: "typescript", href: "https://www.typescriptlang.org" },
  { name: "React", icon: "react", href: "https://react.dev" },
  { name: "Flutter", icon: "flutter" },
  { name: "Dart", icon: "dart" },
  { name: "Git", icon: "git" },
  { name: "PostgreSQL", icon: "postgres" },
  { name: "MySQL", icon: "mysql" },
  { name: "Supabase", icon: "supabase", href: "https://supabase.com" },
  { name: "Docker", icon: "docker" },
  { name: "Postman", icon: "postman" },
  { name: "Vite", icon: "vite" },
  { name: "Express", icon: "express" },
];

export const SKILLICONS_THEME = "dark" as const;
