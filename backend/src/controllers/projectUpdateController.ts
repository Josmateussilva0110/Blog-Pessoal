import type { Request, Response } from "express"
import { projectUpdateErrorHttpStatusMap } from "../errors/projectUpdates"
import ProjectUpdateService from "../services/ProjectUpdateService"
import { IdParamSchema } from "../schemas/common/idParam"
import { PaginationQuerySchema } from "../schemas/common/pagination"
import { ProjectUpdateParamSchema, ProjectUpdatePayloadSchema } from "../schemas/projectUpdates/projectUpdate"
import { requireValidated } from "../utils/http/requireValidated"
import { sendFailure } from "../utils/http/sendFailure"
import { sendSuccess } from "../utils/http/sendSuccess"

class ProjectUpdateController {
  async list(request: Request, response: Response): Promise<Response> {
    const { id } = requireValidated(request, "params", IdParamSchema)
    const result = await ProjectUpdateService.listByProject(
      id,
      requireValidated(request, "query", PaginationQuerySchema)
    )

    if (!result.status) return sendFailure(response, result.error, projectUpdateErrorHttpStatusMap)

    return sendSuccess(response, "Atualizações carregadas.", result.data)
  }

  async create(request: Request, response: Response): Promise<Response> {
    const { id } = requireValidated(request, "params", IdParamSchema)
    const result = await ProjectUpdateService.create(id, requireValidated(request, "body", ProjectUpdatePayloadSchema))

    if (!result.status) return sendFailure(response, result.error, projectUpdateErrorHttpStatusMap)

    return sendSuccess(response, "Atualização publicada.", result.data, 201)
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id, updateId } = requireValidated(request, "params", ProjectUpdateParamSchema)
    const result = await ProjectUpdateService.update(
      id,
      updateId,
      requireValidated(request, "body", ProjectUpdatePayloadSchema)
    )

    if (!result.status) return sendFailure(response, result.error, projectUpdateErrorHttpStatusMap)

    return sendSuccess(response, "Atualização salva.", result.data)
  }

  async remove(request: Request, response: Response): Promise<Response> {
    const { id, updateId } = requireValidated(request, "params", ProjectUpdateParamSchema)
    const result = await ProjectUpdateService.remove(id, updateId)

    if (!result.status) return sendFailure(response, result.error, projectUpdateErrorHttpStatusMap)

    return sendSuccess(response, "Atualização excluída.")
  }
}

export default new ProjectUpdateController()
