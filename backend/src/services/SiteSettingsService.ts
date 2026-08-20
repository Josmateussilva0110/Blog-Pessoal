import type { HeroStats } from "@blog/shared"
import { heroStatsSchema } from "@blog/shared"
import { supabaseAdmin } from "../database/supabase/supabase"
import { DEFAULT_HERO_STATS, HERO_STATS_KEY } from "../constants/siteSettings.constants"
import { SiteSettingsErrorCode } from "../types/code/siteSettingsCode"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { heroStatsCache } from "../utils/site-settings/siteSettingsCache"

class SiteSettingsService {
  async getHeroStats(): Promise<ServiceResult<HeroStats, SiteSettingsErrorCode>> {
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
        return {
          status: false,
          error: {
            code: SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED,
            message: "Erro ao carregar estatísticas.",
          },
        }
      }

      const parsed = heroStatsSchema.safeParse(data?.value ?? DEFAULT_HERO_STATS)
      const stats = parsed.success ? parsed.data : DEFAULT_HERO_STATS
      heroStatsCache.set("public", stats)

      return { status: true, data: stats }
    } catch (error) {
      console.error("[SiteSettingsService.getHeroStats] error:", error)
      return {
        status: false,
        error: {
          code: SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED,
          message: "Erro ao carregar estatísticas.",
        },
      }
    }
  }

  async updateHeroStats(payload: HeroStats): Promise<ServiceResult<HeroStats, SiteSettingsErrorCode>> {
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
            code: SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED,
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
          code: SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED,
          message: "Erro ao atualizar estatísticas.",
        },
      }
    }
  }
}

export default new SiteSettingsService()
