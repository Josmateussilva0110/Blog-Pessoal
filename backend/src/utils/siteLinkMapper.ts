import type { SiteLink, SiteLinkCategory } from "@blog/shared"

type SiteLinkRow = {
  id: string
  category: SiteLinkCategory
  label: string
  href: string | null
  icon: string | null
  external: boolean
  sort_order: number
}

export const SITE_LINK_SELECT =
  "id, category, label, href, icon, external, sort_order"

export function mapSiteLinkRow(row: SiteLinkRow): SiteLink {
  return {
    id: row.id,
    category: row.category,
    label: row.label,
    href: row.href ?? undefined,
    icon: row.icon ?? undefined,
    external: row.external,
    sortOrder: row.sort_order,
  }
}
