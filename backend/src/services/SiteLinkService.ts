import type { SiteLinksGrouped } from "@blog/shared"
import { PUBLIC_CACHE_KEY } from "../constants/cache"
import { REPLACE_SITE_LINKS_RPC, SITE_LINK_SELECT } from "../constants/siteLinks"
import { supabaseAdmin } from "../database/supabase/supabase"
import type { UpdateSiteLinksDTO } from "../schemas/siteLinks/siteLinks"
import type { SiteLinkResult } from "../types/siteLinks"
import { SiteLinkErrorCode } from "../types/siteLinks/errorCode"
import type { SiteLinkRow } from "../types/siteLinks/row"
import { siteLinksCache } from "../utils/siteLinks/siteLinkCache"
import { mapSiteLinkRow } from "../utils/siteLinks/siteLinkMapper"
import { groupSiteLinks, toSiteLinkRows } from "../utils/siteLinks/siteLinkRows"

class SiteLinkService {
  async list(): Promise<SiteLinkResult<SiteLinksGrouped>> {
    try {
      const cached = siteLinksCache.get(PUBLIC_CACHE_KEY)
      if (cached) return { status: true, data: cached }

      const { data, error } = await supabaseAdmin
        .from("site_links")
        .select(SITE_LINK_SELECT)
        .order("sort_order", { ascending: true })
        .returns<SiteLinkRow[]>()

      if (error) {
        console.error("[SiteLinkService.list]", error)
        return { status: false, error: { code: SiteLinkErrorCode.SITE_LINK_FETCH_FAILED } }
      }

      const grouped = groupSiteLinks((data ?? []).map(mapSiteLinkRow))
      siteLinksCache.set(PUBLIC_CACHE_KEY, grouped)

      return { status: true, data: grouped }
    } catch (error) {
      console.error("[SiteLinkService.list] error:", error)
      return { status: false, error: { code: SiteLinkErrorCode.SITE_LINK_FETCH_FAILED } }
    }
  }

  /** Troca todos os links de uma vez: apagar e inserir correm na mesma transação, no banco */
  async replaceAll(payload: UpdateSiteLinksDTO): Promise<SiteLinkResult<null>> {
    try {
      const { error } = await supabaseAdmin.rpc(REPLACE_SITE_LINKS_RPC, { p_links: toSiteLinkRows(payload) })

      if (error) {
        console.error("[SiteLinkService.replaceAll]", error)
        return { status: false, error: { code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED } }
      }

      siteLinksCache.delete(PUBLIC_CACHE_KEY)
      return { status: true, data: null }
    } catch (error) {
      console.error("[SiteLinkService.replaceAll] error:", error)
      return { status: false, error: { code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED } }
    }
  }
}

export default new SiteLinkService()
