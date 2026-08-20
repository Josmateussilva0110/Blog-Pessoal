import type { SiteLinksGrouped } from "@blog/shared";
import { NAV_LINKS } from "./constants";
import { SKILLS } from "./skills";

export const DEFAULT_SITE_LINKS: SiteLinksGrouped = {
  nav: NAV_LINKS.map((link, index) => ({
    id: `default-nav-${index}`,
    category: "nav" as const,
    label: link.label,
    href: link.href,
    external: "external" in link ? Boolean(link.external) : false,
    sortOrder: index,
  })),
  social: [
    {
      id: "default-social-github",
      category: "social",
      label: "github",
      href: "https://github.com",
      external: true,
      sortOrder: 0,
    },
    {
      id: "default-social-linkedin",
      category: "social",
      label: "linkedin",
      href: "https://linkedin.com",
      external: true,
      sortOrder: 1,
    },
  ],
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
