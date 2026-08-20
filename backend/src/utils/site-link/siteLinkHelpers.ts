import { randomUUID } from "node:crypto"
import type { SiteLink, SiteLinkInput, SiteLinksGrouped } from "@blog/shared"

export function groupSiteLinks(links: SiteLink[]): SiteLinksGrouped {
  return {
    nav: links.filter((link) => link.category === "nav"),
    social: links.filter((link) => link.category === "social"),
    skill: links.filter((link) => link.category === "skill"),
  }
}

export function toSiteLinkInsertRow(
  category: keyof SiteLinksGrouped,
  link: SiteLinkInput,
  sortOrder: number
) {
  return {
    id: link.id ?? randomUUID(),
    category,
    label: link.label,
    href: link.href ?? null,
    icon: link.icon ?? null,
    external: link.external ?? false,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  }
}
