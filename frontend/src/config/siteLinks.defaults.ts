import type { SiteLinksGrouped } from "@blog/shared";
import { NAV_LINKS } from "./constants";

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
  // Ferramentas só do banco (editadas no admin): uma lista fixa aqui ficaria desatualizada
  // e apareceria por um instante antes da real
  skill: [],
};
