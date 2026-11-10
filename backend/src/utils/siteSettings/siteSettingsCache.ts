import type { HeroStats } from "@blog/shared"
import { SITE_CONTENT_CACHE_TTL_MS } from "../../constants/cache"
import { ShortCache } from "../cache/shortCache"

export const heroStatsCache = new ShortCache<HeroStats>(SITE_CONTENT_CACHE_TTL_MS)
