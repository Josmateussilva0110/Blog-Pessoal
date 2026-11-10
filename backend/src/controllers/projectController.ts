import type { Request, Response } from "express"
import { projectErrorHttpStatusMap } from "../errors/projects"
import ProjectService from "../services/ProjectService"
import { IdParamSchema } from "../schemas/common/idParam"
import { PaginationQuerySchema } from "../schemas/common/pagination"
import { ProjectPayloadSchema, ProjectSlugParamSchema } from "../schemas/projects/project"
import { requireAuthField } from "../utils/auth/requireAuthField"
import { setPublicCacheHeaders } from "../utils/http/httpCache"
import { getUploadedImages } from "../utils/http/getUploadedImages"
import { requireValidated } from "../utils/http/requireValidated"
import { sendFailure } from "../utils/http/sendFailure"
import { sendSuccess } from "../utils/http/sendSuccess"

class ProjectController {
  async list(request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.list(requireValidated(request, "query", PaginationQuerySchema))

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Projetos carregados.", result.data)
  }

  async listHome(_request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.listHome()

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Projetos carregados.", result.data)
  }

  async listFeatured(request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.listFeatured(requireValidated(request, "query", PaginationQuerySchema))

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Projetos em destaque carregados.", result.data)
  }

  async count(_request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.count()

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Total de projetos carregado.", { count: result.data })
  }

  async listAdmin(request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.listAdmin(requireValidated(request, "query", PaginationQuerySchema))

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    return sendSuccess(response, "Projetos carregados.", result.data)
  }

  async getBySlug(request: Request, response: Response): Promise<Response> {
    const { slug } = requireValidated(request, "params", ProjectSlugParamSchema)
    const result = await ProjectService.getBySlug(slug)

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    setPublicCacheHeaders(response)
    return sendSuccess(response, "Projeto carregado.", result.data)
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { id } = requireValidated(request, "params", IdParamSchema)
    const result = await ProjectService.getById(id)

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    return sendSuccess(response, "Projeto carregado.", result.data)
  }

  async create(request: Request, response: Response): Promise<Response> {
    const result = await ProjectService.create(
      requireAuthField(request, "userId"),
      requireValidated(request, "body", ProjectPayloadSchema),
      getUploadedImages(request)
    )

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    return sendSuccess(response, "Projeto criado com sucesso.", result.data, 201)
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = requireValidated(request, "params", IdParamSchema)
    const result = await ProjectService.update(
      id,
      requireValidated(request, "body", ProjectPayloadSchema),
      getUploadedImages(request)
    )

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    return sendSuccess(response, "Projeto atualizado com sucesso.", result.data)
  }

  async remove(request: Request, response: Response): Promise<Response> {
    const { id } = requireValidated(request, "params", IdParamSchema)
    const result = await ProjectService.remove(id)

    if (!result.status) return sendFailure(response, result.error, projectErrorHttpStatusMap)

    return sendSuccess(response, "Projeto excluído com sucesso.")
  }
}

export default new ProjectController()
