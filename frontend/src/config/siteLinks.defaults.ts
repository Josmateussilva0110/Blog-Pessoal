import type { SiteLinksGrouped } from "@blog/shared";
import { NAV_LINKS } from "./constants";
import { SKILLS } from "./skills";

/** Usado no site público enquanto os links carregam ou se a API falhar */
export const DEFAULT_SITE_LINKS: SiteLinksGrouped = {
  nav: NAV_LINKS.map((link, index) => ({
    id: `default-nav-${index}`,
    category: "nav" as const,
    label: link.label,
    href: link.href,
    external: "external" in link ? Boolean(link.external) : false,
    sortOrder: index,
  })),
  // Sem links sociais de reserva: enquanto a API não responde, melhor não mostrar nada
  // do que um link genérico
  social: [],
  skill: SKILLS.map((skill, index) => ({
    id: `default-skill-${index}`,
    category: "skill" as const,
    label: skill.name,
    icon: skill.icon,
    href: skill.href,
    external: Boolean(skill.href),
    sortOrder: index,
  })),
};
