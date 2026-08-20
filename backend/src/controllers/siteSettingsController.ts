import type { Request, Response } from "express"
import type { HeroStats } from "@blog/shared"
import SiteSettingsService from "../services/SiteSettingsService"
import { setPublicCacheHeaders } from "../utils/httpCache"

class SiteSettingsController {
  async getHeroStats(_request: Request, response: Response): Promise<Response> {
    const result = await SiteSettingsService.getHeroStats()

    if (!result.status) {
      return response.status(500).json({
        success: false,
        message: result.error.message ?? "Erro ao carregar estatísticas.",
      })
    }

    setPublicCacheHeaders(response, 300)
    return response.status(200).json({ success: true, data: result.data })
  }

  async updateHeroStats(request: Request, response: Response): Promise<Response> {
    const payload = request.body as HeroStats
    const result = await SiteSettingsService.updateHeroStats(payload)

    if (!result.status) {
      return response.status(500).json({
        success: false,
        message: result.error.message ?? "Erro ao atualizar estatísticas.",
      })
    }

    return response.status(200).json({
      success: true,
      message: "Estatísticas atualizadas com sucesso.",
      data: result.data,
    })
  }
}

export default new SiteSettingsController()
