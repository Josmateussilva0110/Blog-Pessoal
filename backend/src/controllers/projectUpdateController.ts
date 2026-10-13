import type { Request, Response } from "express"
import type { ProjectUpdateFormValues } from "@blog/shared"
import type { ProjectIdParams, ProjectUpdateParams } from "../schemas/projectSchema"
import ProjectUpdateService from "../services/ProjectUpdateService"
import { projectUpdateErrorHttpStatusMap } from "../errors/projectUpdateErrorHttpMapper"
import { sendServiceError } from "../utils/http/sendServiceError"

class ProjectUpdateController {
  async list(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as ProjectIdParams
    const result = await ProjectUpdateService.listByProject(id)

    if (!result.status) {
      return sendServiceError(response, result.error, projectUpdateErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async create(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as ProjectIdParams
    const result = await ProjectUpdateService.create(id, request.body as ProjectUpdateFormValues)

    if (!result.status) {
      return sendServiceError(response, result.error, projectUpdateErrorHttpStatusMap)
    }

    return response.status(201).json({
      success: true,
      message: "Atualização publicada.",
      data: result.data,
    })
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id, updateId } = request.validatedParams as ProjectUpdateParams
    const result = await ProjectUpdateService.update(
      id,
      updateId,
      request.body as ProjectUpdateFormValues
    )

    if (!result.status) {
      return sendServiceError(response, result.error, projectUpdateErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Atualização salva.",
      data: result.data,
    })
  }

  async remove(request: Request, response: Response): Promise<Response> {
    const { id, updateId } = request.validatedParams as ProjectUpdateParams
    const result = await ProjectUpdateService.remove(id, updateId)

    if (!result.status) {
      return sendServiceError(response, result.error, projectUpdateErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Atualização excluída.",
    })
  }
}

export default new ProjectUpdateController()
