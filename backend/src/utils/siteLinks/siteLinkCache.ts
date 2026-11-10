import type { SiteLinksGrouped } from "@blog/shared"
import { SITE_CONTENT_CACHE_TTL_MS } from "../../constants/cache"
import { ShortCache } from "../cache/shortCache"

export const siteLinksCache = new ShortCache<SiteLinksGrouped>(SITE_CONTENT_CACHE_TTL_MS)
