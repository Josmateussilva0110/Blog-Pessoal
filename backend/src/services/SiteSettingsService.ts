import type { HeroStats } from "@blog/shared"
import { heroStatsSchema } from "@blog/shared"
import { PUBLIC_CACHE_KEY } from "../constants/cache"
import { DEFAULT_HERO_STATS, HERO_STATS_KEY } from "../constants/siteSettings"
import { supabaseAdmin } from "../database/supabase/supabase"
import type { UpdateHeroStatsDTO } from "../schemas/siteSettings/heroStats"
import type { SiteSettingsResult } from "../types/siteSettings"
import { SiteSettingsErrorCode } from "../types/siteSettings/errorCode"
import { heroStatsCache } from "../utils/siteSettings/siteSettingsCache"

class SiteSettingsService {
  async getHeroStats(): Promise<SiteSettingsResult<HeroStats>> {
    try {
      const cached = heroStatsCache.get(PUBLIC_CACHE_KEY)
      if (cached) return { status: true, data: cached }

      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", HERO_STATS_KEY)
        .maybeSingle()

      if (error) {
        console.error("[SiteSettingsService.getHeroStats]", error)
        return { status: false, error: { code: SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED } }
      }

      // Valor gravado fora do formato atual cai no padrão em vez de quebrar a home
      const parsed = heroStatsSchema.safeParse(data?.value ?? DEFAULT_HERO_STATS)
      const stats = parsed.success ? parsed.data : DEFAULT_HERO_STATS
      heroStatsCache.set(PUBLIC_CACHE_KEY, stats)

      return { status: true, data: stats }
    } catch (error) {
      console.error("[SiteSettingsService.getHeroStats] error:", error)
      return { status: false, error: { code: SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED } }
    }
  }

  async updateHeroStats(payload: UpdateHeroStatsDTO): Promise<SiteSettingsResult<null>> {
    try {
      const { error } = await supabaseAdmin.from("site_settings").upsert({
        key: HERO_STATS_KEY,
        value: payload,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("[SiteSettingsService.updateHeroStats]", error)
        return { status: false, error: { code: SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED } }
      }

      heroStatsCache.set(PUBLIC_CACHE_KEY, payload)
      return { status: true, data: null }
    } catch (error) {
      console.error("[SiteSettingsService.updateHeroStats] error:", error)
      return { status: false, error: { code: SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED } }
    }
  }
}

export default new SiteSettingsService()
