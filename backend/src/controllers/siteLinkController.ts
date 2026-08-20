import type { Request, Response } from "express"
import SiteLinkService from "../services/SiteLinkService"
import { siteLinkErrorHttpStatusMap } from "../errors/siteLinkErrorHttpMapper"
import { sendServiceError } from "../utils/http/sendServiceError"
import type { UpdateSiteLinksInput } from "@blog/shared"
import { setPublicCacheHeaders } from "../utils/http/httpCache"

class SiteLinkController {
  async list(_request: Request, response: Response): Promise<Response> {
    const result = await SiteLinkService.list()

    if (!result.status) {
      return sendServiceError(response, result.error, siteLinkErrorHttpStatusMap)
    }

    setPublicCacheHeaders(response, 300)
    return response.status(200).json({ success: true, data: result.data })
  }

  async replaceAll(request: Request, response: Response): Promise<Response> {
    const payload = request.body as UpdateSiteLinksInput
    const result = await SiteLinkService.replaceAll(payload)

    if (!result.status) {
      return sendServiceError(response, result.error, siteLinkErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Links atualizados com sucesso.",
      data: result.data,
    })
  }
}

export default new SiteLinkController()
