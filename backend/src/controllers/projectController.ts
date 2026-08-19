import type { Request, Response } from "express"
import type { ProjectIdParams, ProjectSlugParams } from "../schemas/projectSchema"
import ProjectService from "../services/ProjectService"
import { projectErrorHttpStatusMap } from "../errors/projectErrorHttpMapper"
import { sendServiceError } from "../utils/sendServiceError"
import { getUploadedImages, parseProjectPayload } from "../utils/projectRequest"

class ProjectController {
  async list(_request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.list()

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async listFeatured(_request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.listFeatured()

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async listAll(_request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.listAll()

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async getBySlug(request: Request, response: Response): Promise<Response> {
    const { slug } = request.validatedParams as ProjectSlugParams
    const result = await ProjectService.getBySlug(slug)

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as ProjectIdParams
    const result = await ProjectService.getById(id)

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({ success: true, data: result.data })
  }

  async create(request: Request, response: Response): Promise<Response> {
    try {
      const payload = parseProjectPayload(request)
      const result = await ProjectService.create(
        request.accessToken,
        payload,
        getUploadedImages(request)
      )

      if (!result.status) {
        return sendServiceError(response, result.error, projectErrorHttpStatusMap)
      }

      return response.status(201).json({
        success: true,
        message: "Projeto criado com sucesso.",
        data: result.data,
      })
    } catch (error) {
      const message =
        error instanceof Error && error.message === "MISSING_PAYLOAD"
          ? "Dados do formulário inválidos."
          : "Não foi possível validar os dados do projeto."

      return response.status(422).json({ success: false, message })
    }
  }

  async update(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.validatedParams as ProjectIdParams
      const payload = parseProjectPayload(request)
      const result = await ProjectService.update(
        request.accessToken,
        id,
        payload,
        getUploadedImages(request)
      )

      if (!result.status) {
        return sendServiceError(response, result.error, projectErrorHttpStatusMap)
      }

      return response.status(200).json({
        success: true,
        message: "Projeto atualizado com sucesso.",
        data: result.data,
      })
    } catch (error) {
      const message =
        error instanceof Error && error.message === "MISSING_PAYLOAD"
          ? "Dados do formulário inválidos."
          : "Não foi possível validar os dados do projeto."

      return response.status(422).json({ success: false, message })
    }
  }

  async remove(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as ProjectIdParams
    const result = await ProjectService.remove(id)

    if (!result.status) {
      return sendServiceError(response, result.error, projectErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Projeto excluído com sucesso.",
    })
  }
}

export default new ProjectController()
