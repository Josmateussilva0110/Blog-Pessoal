import type { HeroStats } from "@blog/shared"
import { heroStatsSchema } from "@blog/shared"
import { supabaseAdmin } from "../database/supabase/supabase"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ShortCache } from "../utils/shortCache"

const HERO_STATS_KEY = "hero_stats"
const heroStatsCache = new ShortCache<HeroStats>(60_000)

const DEFAULT_HERO_STATS: HeroStats = {
  yearsCoding: 4,
}

class SiteSettingsService {
  async getHeroStats(): Promise<ServiceResult<HeroStats, string>> {
    try {
      const cached = heroStatsCache.get("public")
      if (cached) {
        return { status: true, data: cached }
      }

      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", HERO_STATS_KEY)
        .maybeSingle()

      if (error) {
        console.error("[SiteSettingsService.getHeroStats]", error)
        return { status: true, data: DEFAULT_HERO_STATS }
      }

      const parsed = heroStatsSchema.safeParse(data?.value ?? DEFAULT_HERO_STATS)
      const stats = parsed.success ? parsed.data : DEFAULT_HERO_STATS
      heroStatsCache.set("public", stats)

      return { status: true, data: stats }
    } catch (error) {
      console.error("[SiteSettingsService.getHeroStats] error:", error)
      return { status: true, data: DEFAULT_HERO_STATS }
    }
  }

  async updateHeroStats(payload: HeroStats): Promise<ServiceResult<HeroStats, string>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .upsert({
          key: HERO_STATS_KEY,
          value: payload,
          updated_at: new Date().toISOString(),
        })
        .select("value")
        .single()

      if (error) {
        console.error("[SiteSettingsService.updateHeroStats]", error)
        return {
          status: false,
          error: {
            code: "SITE_SETTINGS_UPDATE_FAILED",
            message: "Erro ao atualizar estatísticas.",
          },
        }
      }

      const parsed = heroStatsSchema.parse(data.value)
      heroStatsCache.set("public", parsed)

      return { status: true, data: parsed }
    } catch (error) {
      console.error("[SiteSettingsService.updateHeroStats] error:", error)
      return {
        status: false,
        error: {
          code: "SITE_SETTINGS_UPDATE_FAILED",
          message: "Erro ao atualizar estatísticas.",
        },
      }
    }
  }
}

export default new SiteSettingsService()
