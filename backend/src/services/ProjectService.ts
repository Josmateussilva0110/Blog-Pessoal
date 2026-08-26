import type { ProjectFormValues } from "@blog/shared"
import { supabaseAdmin } from "../database/supabase/supabase"
import { PROJECT_SELECT, PROJECT_LIST_SELECT, mapProjectRow, mapProjectListRow } from "../utils/project/projectMapper"
import type { UploadableFile } from "../types/projects/uploadableFile"
import {
  PROJECT_ASSETS_BUCKET,
  PROJECT_IMAGES_BUCKET,
  extractStoragePathFromUrl,
  removeProjectStorage,
  removeStoragePaths,
  uploadProjectImages,
} from "../utils/project/projectStorage"
import { invalidateProjectsCache, projectsCountCache, projectsListCache } from "../utils/project/projectCache"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ProjectErrorCode } from "../types/code/projectCode"
import type { Project } from "@blog/shared"
import { resolveUserIdFromAccessToken } from "../utils/auth/accessToken"
import { normalizeProjectStatus } from "../utils/project/projectStatus"

class ProjectService {
  private async resolveAuthenticatedUserId(
    accessToken: string
  ): Promise<ServiceResult<string, ProjectErrorCode>> {
    const userId = await resolveUserIdFromAccessToken(accessToken)

    if (!userId) {
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_CREATE_FAILED,
          message: "Sessão inválida.",
        },
      }
    }

    return { status: true, data: userId }
  }

  private async ensureSlugAvailable(
    slug: string,
    ignoreId?: string
  ): Promise<ServiceResult<null, ProjectErrorCode>> {
    if (await this.slugExists(slug, ignoreId)) {
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_SLUG_EXISTS,
          message: "Já existe um projeto com este slug.",
        },
      }
    }

    return { status: true, data: null }
  }

  private async ensureSlugAvailableForUpdate(
    currentSlug: string,
    nextSlug: string,
    projectId: string
  ): Promise<ServiceResult<null, ProjectErrorCode>> {
    if (currentSlug === nextSlug) {
      return { status: true, data: null }
    }

    return this.ensureSlugAvailable(nextSlug, projectId)
  }

  private buildProjectFields(payload: ProjectFormValues, images: string[]) {
    return {
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? "",
      content_markdown: payload.contentMarkdown ?? "",
      status: normalizeProjectStatus(payload.status),
      tech_stack: payload.techStack,
      repo_url: payload.repoUrl ?? null,
      cover_image_url: images[0] ?? null,
      images,
      markdown_files: [],
      featured: payload.featured,
    }
  }

  private buildProjectInsertPayload(userId: string, payload: ProjectFormValues) {
    return {
      ...this.buildProjectFields(payload, payload.images),
      created_by: userId,
      ...(payload.updatedAt ? { updated_at: payload.updatedAt } : {}),
    }
  }

  private buildProjectUpdatePayload(payload: ProjectFormValues) {
    return {
      ...this.buildProjectFields(payload, payload.images),
      updated_at: payload.updatedAt ?? new Date().toISOString(),
    }
  }

  private async insertProjectRecord(
    userId: string,
    payload: ProjectFormValues
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert(this.buildProjectInsertPayload(userId, payload))
      .select(PROJECT_SELECT)
      .single()

    if (error || !data) {
      console.error("[ProjectService.insertProjectRecord]", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_CREATE_FAILED,
          message: "Não foi possível criar o projeto.",
        },
      }
    }

    return { status: true, data: mapProjectRow(data) }
  }

  private async updateProjectRecord(
    id: string,
    payload: ProjectFormValues
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(this.buildProjectUpdatePayload(payload))
      .eq("id", id)
      .select(PROJECT_SELECT)
      .single()

    if (error || !data) {
      console.error("[ProjectService.updateProjectRecord]", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_UPDATE_FAILED,
          message: "Não foi possível atualizar o projeto.",
        },
      }
    }

    return { status: true, data: mapProjectRow(data) }
  }

  private collectRemovedImagePaths(existingUrls: string[], keptUrls: string[]): string[] {
    return existingUrls
      .filter((url) => !keptUrls.includes(url))
      .map((url) => extractStoragePathFromUrl(url, PROJECT_IMAGES_BUCKET))
      .filter((path): path is string => path !== null)
  }

  private resolveOrderedImages(payload: ProjectFormValues, uploadedUrls: string[]): string[] {
    if (payload.imageOrder?.length) {
      return payload.imageOrder.map((entry) => {
        if (typeof entry === "string") return entry
        return uploadedUrls[entry.pending] ?? ""
      }).filter((url) => url.length > 0)
    }

    return [...payload.images, ...uploadedUrls]
  }

  private collectRemovedMarkdownPaths(project: Project): string[] {
    return project.markdownFiles.map((file) => file.path)
  }

  private async cleanupRemovedProjectAssets(
    removedImagePaths: string[],
    removedMarkdownPaths: string[]
  ): Promise<void> {
    await removeStoragePaths(PROJECT_IMAGES_BUCKET, removedImagePaths).catch((error) => {
      console.error("[ProjectService.cleanupRemovedProjectAssets] image cleanup failed:", error)
    })

    if (removedMarkdownPaths.length > 0) {
      await removeStoragePaths(PROJECT_ASSETS_BUCKET, removedMarkdownPaths).catch((error) => {
        console.error("[ProjectService.cleanupRemovedProjectAssets] markdown cleanup failed:", error)
      })
    }
  }

  private async updateProjectImages(
    projectId: string,
    images: string[],
    failure: {
      failureCode: ProjectErrorCode
      failureMessage: string
    } = {
      failureCode: ProjectErrorCode.PROJECT_CREATE_FAILED,
      failureMessage: "Não foi possível criar o projeto.",
    }
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({
        cover_image_url: images[0] ?? null,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select(PROJECT_SELECT)
      .single()

    if (error || !data) {
      console.error("[ProjectService.updateProjectImages]", error)
      return {
        status: false,
        error: {
          code: failure.failureCode,
          message: failure.failureMessage,
        },
      }
    }

    return { status: true, data: mapProjectRow(data) }
  }

  private async attachUploadedImagesToProject(
    project: Project,
    payload: ProjectFormValues,
    imageFiles: UploadableFile[]
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    const uploadedImages = await this.safeUploadImages(project.id, imageFiles)

    if (!uploadedImages.status) {
      await this.cleanupCreatedProject(project.id)
      return uploadedImages
    }

    const images = this.resolveOrderedImages(payload, uploadedImages.data)
    const updated = await this.updateProjectImages(project.id, images)

    if (!updated.status) {
      await this.cleanupUploadedImageUrls(uploadedImages.data)
      await this.cleanupCreatedProject(project.id)
      return updated
    }

    invalidateProjectsCache()
    return updated
  }

  private async attachUploadedImagesToExistingProject(
    projectId: string,
    existing: Project,
    payload: ProjectFormValues,
    imageFiles: UploadableFile[],
    removedMarkdownPaths: string[]
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    const uploadedImages = await this.safeUploadImages(projectId, imageFiles)
    if (!uploadedImages.status) return uploadedImages

    const images = this.resolveOrderedImages(payload, uploadedImages.data)
    const removedImagePaths = this.collectRemovedImagePaths(existing.images, images)

    const updated = await this.updateProjectImages(projectId, images, {
      failureCode: ProjectErrorCode.PROJECT_UPDATE_FAILED,
      failureMessage: "Não foi possível atualizar o projeto.",
    })

    if (!updated.status) {
      await this.cleanupUploadedImageUrls(uploadedImages.data)
      return updated
    }

    await this.cleanupRemovedProjectAssets(removedImagePaths, removedMarkdownPaths)
    invalidateProjectsCache()
    return updated
  }

  private async slugExists(slug: string, ignoreId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("projects").select("id").eq("slug", slug)

    if (ignoreId) {
      query = query.neq("id", ignoreId)
    }

    const { data } = await query.maybeSingle()
    return Boolean(data?.id)
  }

  private async cleanupCreatedProject(projectId: string): Promise<void> {
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("[ProjectService.cleanupCreatedProject]", error)
    }
  }

  private async cleanupUploadedImageUrls(urls: string[]): Promise<void> {
    const paths = urls
      .map((url) => extractStoragePathFromUrl(url, PROJECT_IMAGES_BUCKET))
      .filter((path): path is string => path !== null)

    await removeStoragePaths(PROJECT_IMAGES_BUCKET, paths).catch((error) => {
      console.error("[ProjectService.cleanupUploadedImageUrls]", error)
    })
  }

  private async safeUploadImages(projectId: string, files: UploadableFile[]) {
    try {
      const urls = await uploadProjectImages(projectId, files)
      return { status: true as const, data: urls }
    } catch (error) {
      console.error("[ProjectService.safeUploadImages]", error)
      return {
        status: false as const,
        error: {
          code:
            error instanceof Error && error.message === "INVALID_IMAGE_TYPE"
              ? ProjectErrorCode.PROJECT_ASSET_INVALID
              : ProjectErrorCode.PROJECT_CREATE_FAILED,
          message:
            error instanceof Error && error.message === "INVALID_IMAGE_TYPE"
              ? "Envie apenas imagens JPEG, PNG, WebP ou GIF."
              : "Erro ao enviar imagens do projeto.",
        },
      }
    }
  }

  async list(): Promise<ServiceResult<Project[], ProjectErrorCode>> {
    try {
      const cached = projectsListCache.get("public")
      if (cached) {
        return { status: true, data: cached }
      }

      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_LIST_SELECT)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("[ProjectService.list]", error)
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_FETCH_FAILED,
            message: "Erro ao listar projetos.",
          },
        }
      }

      const projects = (data ?? []).map(mapProjectListRow)
      projectsListCache.set("public", projects)

      return {
        status: true,
        data: projects,
      }
    } catch (error) {
      console.error("[ProjectService.list] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao listar projetos.",
        },
      }
    }
  }

  async listAll(): Promise<ServiceResult<Project[], ProjectErrorCode>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_SELECT)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("[ProjectService.listAll]", error)
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_FETCH_FAILED,
            message: "Erro ao listar projetos.",
          },
        }
      }

      return {
        status: true,
        data: (data ?? []).map(mapProjectRow),
      }
    } catch (error) {
      console.error("[ProjectService.listAll] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao listar projetos.",
        },
      }
    }
  }

  async listFeatured(): Promise<ServiceResult<Project[], ProjectErrorCode>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_LIST_SELECT)
        .eq("featured", true)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("[ProjectService.listFeatured]", error)
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_FETCH_FAILED,
            message: "Erro ao listar projetos em destaque.",
          },
        }
      }

      return {
        status: true,
        data: (data ?? []).map(mapProjectListRow),
      }
    } catch (error) {
      console.error("[ProjectService.listFeatured] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao listar projetos em destaque.",
        },
      }
    }
  }

  async count(): Promise<ServiceResult<number, ProjectErrorCode>> {
    try {
      const cached = projectsCountCache.get("public")
      if (cached !== undefined) {
        return { status: true, data: cached }
      }

      const { count, error } = await supabaseAdmin
        .from("projects")
        .select("id", { count: "exact", head: true })

      if (error) {
        console.error("[ProjectService.count]", error)
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_FETCH_FAILED,
            message: "Erro ao contar projetos.",
          },
        }
      }

      const total = count ?? 0
      projectsCountCache.set("public", total)

      return {
        status: true,
        data: total,
      }
    } catch (error) {
      console.error("[ProjectService.count] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao contar projetos.",
        },
      }
    }
  }

  async getBySlug(slug: string): Promise<ServiceResult<Project, ProjectErrorCode>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_SELECT)
        .eq("slug", slug)
        .maybeSingle()

      if (error || !data) {
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_NOT_FOUND,
            message: "Projeto não encontrado.",
          },
        }
      }

      return {
        status: true,
        data: mapProjectRow(data),
      }
    } catch (error) {
      console.error("[ProjectService.getBySlug] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao buscar projeto.",
        },
      }
    }
  }

  async getById(id: string): Promise<ServiceResult<Project, ProjectErrorCode>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_SELECT)
        .eq("id", id)
        .maybeSingle()

      if (error || !data) {
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_NOT_FOUND,
            message: "Projeto não encontrado.",
          },
        }
      }

      return {
        status: true,
        data: mapProjectRow(data),
      }
    } catch (error) {
      console.error("[ProjectService.getById] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_FETCH_FAILED,
          message: "Erro ao buscar projeto.",
        },
      }
    }
  }

  async create(
    accessToken: string,
    payload: ProjectFormValues,
    imageFiles: UploadableFile[]
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    try {
      const userResult = await this.resolveAuthenticatedUserId(accessToken)
      if (!userResult.status) return userResult

      const slugResult = await this.ensureSlugAvailable(payload.slug)
      if (!slugResult.status) return slugResult

      const created = await this.insertProjectRecord(userResult.data, payload)
      if (!created.status) return created

      if (imageFiles.length === 0) {
        invalidateProjectsCache()
        return created
      }

      return this.attachUploadedImagesToProject(created.data, payload, imageFiles)
    } catch (error) {
      console.error("[ProjectService.create] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_CREATE_FAILED,
          message: "Erro ao criar projeto.",
        },
      }
    }
  }

  async update(
    accessToken: string,
    id: string,
    payload: ProjectFormValues,
    imageFiles: UploadableFile[]
  ): Promise<ServiceResult<Project, ProjectErrorCode>> {
    try {
      const existing = await this.getById(id)
      if (!existing.status) return existing

      const slugResult = await this.ensureSlugAvailableForUpdate(
        existing.data.slug,
        payload.slug,
        id
      )
      if (!slugResult.status) return slugResult

      const updated = await this.updateProjectRecord(id, payload)
      if (!updated.status) return updated

      const removedMarkdownPaths = this.collectRemovedMarkdownPaths(existing.data)

      if (imageFiles.length === 0) {
        const removedImagePaths = this.collectRemovedImagePaths(
          existing.data.images,
          payload.images
        )
        await this.cleanupRemovedProjectAssets(removedImagePaths, removedMarkdownPaths)
        return updated
      }

      return this.attachUploadedImagesToExistingProject(
        id,
        existing.data,
        payload,
        imageFiles,
        removedMarkdownPaths
      )
    } catch (error) {
      console.error("[ProjectService.update] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_UPDATE_FAILED,
          message: "Erro ao atualizar projeto.",
        },
      }
    }
  }

  async remove(id: string): Promise<ServiceResult<null, ProjectErrorCode>> {
    try {
      const existing = await this.getById(id)
      if (!existing.status) return existing

      const { error } = await supabaseAdmin.from("projects").delete().eq("id", id)

      if (error) {
        console.error("[ProjectService.remove]", error)
        return {
          status: false,
          error: {
            code: ProjectErrorCode.PROJECT_DELETE_FAILED,
            message: "Não foi possível excluir o projeto.",
          },
        }
      }

      await removeProjectStorage(id).catch((cleanupError) => {
        console.error("[ProjectService.remove] storage cleanup failed:", cleanupError)
      })

      invalidateProjectsCache()
      return { status: true, data: null }
    } catch (error) {
      console.error("[ProjectService.remove] error:", error)
      return {
        status: false,
        error: {
          code: ProjectErrorCode.PROJECT_DELETE_FAILED,
          message: "Erro ao excluir projeto.",
        },
      }
    }
  }
}

export default new ProjectService()
