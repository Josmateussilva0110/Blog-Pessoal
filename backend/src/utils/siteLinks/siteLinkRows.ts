import { randomUUID } from "node:crypto"
import type { SiteLink, SiteLinkInput, SiteLinksGrouped } from "@blog/shared"

export function groupSiteLinks(links: SiteLink[]): SiteLinksGrouped {
  return {
    nav: links.filter((link) => link.category === "nav"),
    social: links.filter((link) => link.category === "social"),
    skill: links.filter((link) => link.category === "skill"),
  }
}

function toSiteLinkRow(category: keyof SiteLinksGrouped, link: SiteLinkInput, sortOrder: number) {
  return {
    id: link.id ?? randomUUID(),
    category,
    label: link.label,
    href: link.href ?? null,
    icon: link.icon ?? null,
    external: link.external ?? false,
    sort_order: sortOrder,
  }
}

/** Linhas da tabela site_links na ordem enviada, que vira o sort_order de cada categoria */
export function toSiteLinkRows(payload: Record<keyof SiteLinksGrouped, SiteLinkInput[]>) {
  return (Object.keys(payload) as (keyof SiteLinksGrouped)[]).flatMap((category) =>
    payload[category].map((link, index) => toSiteLinkRow(category, link, index))
  )
}
