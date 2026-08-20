import type { SiteLink } from "@blog/shared"
import type { SiteLinkRow } from "../../types/siteLinks/siteLinkRow"

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
