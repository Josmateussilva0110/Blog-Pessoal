import type { HeroStats } from "@blog/shared"
import { ShortCache } from "../cache/shortCache"

export const heroStatsCache = new ShortCache<HeroStats>(60_000)
