import { ROUTES } from "@/config/routes";

export const SITE = {
  name: "mateus.dev",
  title: "Dev Blog",
  tagline: "Código que cria coisas.",
  description:
    "Um espaço para documentar cada projeto — da ideia ao deploy. Apps, sites e experimentos com código real.",
  profileImageAlt: "Foto de perfil",
  role: "full-stack",
  author: "José Mateus",
  githubUrl: "https://github.com/Josmateussilva0110",
} as const;

/** Textos do bloco de apresentação da home */
export const HOME_HERO = {
  eyebrow: `dev ${SITE.role} · android e web`,
  title: "Software que funciona no bolso e no navegador.",
  description: `Sou ${SITE.author}. Crio apps Android e sistemas web, do banco de dados à interface.`,
} as const;

/** A partir daqui o layout tem colunas laterais (explorador da home, índice do projeto) */
export const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export const NAV_LINKS = [
  { label: "home", href: ROUTES.home },
  { label: "projects", href: ROUTES.projectsSection },
  { label: "about", href: ROUTES.aboutSection },
  { label: "github", href: SITE.githubUrl, external: true },
] as const;
