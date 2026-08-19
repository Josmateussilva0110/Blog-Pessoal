export const SITE = {
  name: "mateus.dev",
  title: "Dev Blog",
  tagline: "Código que cria coisas.",
  description:
    "Um espaço para documentar cada projeto — da ideia ao deploy. Apps, sites e experimentos com código real.",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  profileImageAlt: "Foto de perfil",
  stats: {
    yearsCoding: 3,
  },
} as const;

export const NAV_LINKS = [
  { label: "home", href: "/" },
  { label: "projects", href: "/#projetos" },
  { label: "about", href: "/#sobre" },
  { label: "github", href: "https://github.com", external: true },
] as const;
