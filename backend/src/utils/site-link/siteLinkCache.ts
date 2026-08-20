import type { SiteLinksGrouped } from "@blog/shared"
import { ShortCache } from "../cache/shortCache"

export const siteLinksCache = new ShortCache<SiteLinksGrouped>(60_000)
