import type { SiteLinkCategory } from "@blog/shared"

export interface SiteLinkRow {
  id: string
  category: SiteLinkCategory
  label: string
  href: string | null
  icon: string | null
  external: boolean
  sort_order: number
}
