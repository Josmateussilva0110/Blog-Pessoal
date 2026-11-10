import type { Request, Response } from "express"
import { siteSettingsErrorHttpStatusMap } from "../errors/siteSettings"
import SiteSettingsService from "../services/SiteSettingsService"
import { UpdateHeroStatsSchema } from "../schemas/siteSettings/heroStats"
import { setPublicCacheHeaders } from "../utils/http/httpCache"
import { requireValidated } from "../utils/http/requireValidated"
import { sendFailure } from "../utils/http/sendFailure"
import { sendSuccess } from "../utils/http/sendSuccess"

class SiteSettingsController {
  async getHeroStats(_request: Request, response: Response): Promise<Response> {
    const result = await SiteSettingsService.getHeroStats()

    if (!result.status) return sendFailure(response, result.error, siteSettingsErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Estatísticas carregadas.", result.data)
  }

  async updateHeroStats(request: Request, response: Response): Promise<Response> {
    const result = await SiteSettingsService.updateHeroStats(requireValidated(request, "body", UpdateHeroStatsSchema))

    if (!result.status) return sendFailure(response, result.error, siteSettingsErrorHttpStatusMap)

    return sendSuccess(response, "Estatísticas atualizadas com sucesso.")
  }
}

export default new SiteSettingsController()
