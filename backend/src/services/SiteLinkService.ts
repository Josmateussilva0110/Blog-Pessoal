import { randomUUID } from "node:crypto"
import type { SiteLink, SiteLinksGrouped, SiteLinkInput, UpdateSiteLinksInput } from "@blog/shared"
import { supabaseAdmin } from "../database/supabase/supabase"
import { SITE_LINK_SELECT, mapSiteLinkRow } from "../utils/siteLinkMapper"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { SiteLinkErrorCode } from "../types/code/siteLinkCode"
import { ShortCache } from "../utils/shortCache"

type SiteLinkRow = Parameters<typeof mapSiteLinkRow>[0]

const siteLinksCache = new ShortCache<SiteLinksGrouped>(60_000)

function groupLinks(links: SiteLink[]): SiteLinksGrouped {
  return {
    nav: links.filter((link) => link.category === "nav"),
    social: links.filter((link) => link.category === "social"),
    skill: links.filter((link) => link.category === "skill"),
  }
}

function toInsertRow(
  category: keyof SiteLinksGrouped,
  link: SiteLinkInput,
  sortOrder: number
) {
  return {
    id: link.id ?? randomUUID(),
    category,
    label: link.label,
    href: link.href ?? null,
    icon: link.icon ?? null,
    external: link.external ?? false,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  }
}

class SiteLinkService {
  async list(): Promise<ServiceResult<SiteLinksGrouped, SiteLinkErrorCode>> {
    try {
      const cached = siteLinksCache.get("public")
      if (cached) {
        return { status: true, data: cached }
      }

      const { data, error } = await supabaseAdmin
        .from("site_links")
        .select(SITE_LINK_SELECT)
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("[SiteLinkService.list]", error)
        return {
          status: false,
          error: {
            code: SiteLinkErrorCode.SITE_LINK_FETCH_FAILED,
            message: "Erro ao carregar links do site.",
          },
        }
      }

      const links = (data as SiteLinkRow[] | null)?.map(mapSiteLinkRow) ?? []
      const grouped = groupLinks(links)
      siteLinksCache.set("public", grouped)

      return {
        status: true,
        data: grouped,
      }
    } catch (error) {
      console.error("[SiteLinkService.list] error:", error)
      return {
        status: false,
        error: {
          code: SiteLinkErrorCode.SITE_LINK_FETCH_FAILED,
          message: "Erro ao carregar links do site.",
        },
      }
    }
  }

  async replaceAll(
    payload: UpdateSiteLinksInput
  ): Promise<ServiceResult<SiteLinksGrouped, SiteLinkErrorCode>> {
    try {
      const rows = [
        ...payload.nav.map((link, index) => toInsertRow("nav", link, index)),
        ...payload.social.map((link, index) => toInsertRow("social", link, index)),
        ...payload.skill.map((link, index) => toInsertRow("skill", link, index)),
      ]

      const { error: deleteError } = await supabaseAdmin
        .from("site_links")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (deleteError) {
        console.error("[SiteLinkService.replaceAll] delete", deleteError)
        return {
          status: false,
          error: {
            code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED,
            message: "Erro ao atualizar links do site.",
          },
        }
      }

      if (rows.length > 0) {
        const { data, error: insertError } = await supabaseAdmin
          .from("site_links")
          .insert(rows)
          .select(SITE_LINK_SELECT)
          .order("sort_order", { ascending: true })

        if (insertError) {
          console.error("[SiteLinkService.replaceAll] insert", insertError)
          return {
            status: false,
            error: {
              code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED,
              message: "Erro ao atualizar links do site.",
            },
          }
        }

        const links = (data as SiteLinkRow[] | null)?.map(mapSiteLinkRow) ?? []
        const grouped = groupLinks(links)
        siteLinksCache.set("public", grouped)

        return {
          status: true,
          data: grouped,
        }
      }

      siteLinksCache.delete("public")
      return {
        status: true,
        data: { nav: [], social: [], skill: [] },
      }
    } catch (error) {
      console.error("[SiteLinkService.replaceAll] error:", error)
      return {
        status: false,
        error: {
          code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED,
          message: "Erro ao atualizar links do site.",
        },
      }
    }
  }
}

export default new SiteLinkService()
