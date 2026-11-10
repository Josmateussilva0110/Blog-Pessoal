import type { Request, Response } from "express"
import { siteLinkErrorHttpStatusMap } from "../errors/siteLinks"
import SiteLinkService from "../services/SiteLinkService"
import { UpdateSiteLinksSchema } from "../schemas/siteLinks/siteLinks"
import { setPublicCacheHeaders } from "../utils/http/httpCache"
import { requireValidated } from "../utils/http/requireValidated"
import { sendFailure } from "../utils/http/sendFailure"
import { sendSuccess } from "../utils/http/sendSuccess"

class SiteLinkController {
  async list(_request: Request, response: Response): Promise<Response> {
    const result = await SiteLinkService.list()

    if (!result.status) return sendFailure(response, result.error, siteLinkErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Links carregados.", result.data)
  }

  async replaceAll(request: Request, response: Response): Promise<Response> {
    const result = await SiteLinkService.replaceAll(requireValidated(request, "body", UpdateSiteLinksSchema))

    if (!result.status) return sendFailure(response, result.error, siteLinkErrorHttpStatusMap)

    return sendSuccess(response, "Links atualizados com sucesso.")
  }
}

export default new SiteLinkController()
