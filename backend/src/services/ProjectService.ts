import type { HomeProjects, Project } from "@blog/shared"
import { PUBLIC_CACHE_KEY } from "../constants/cache"
import { PG_UNIQUE_VIOLATION } from "../constants/postgres"
import { PROJECT_LIST_SELECT, PROJECT_SELECT } from "../constants/projects"
import { PROJECT_UPDATE_SELECT } from "../constants/projectUpdates"
import { PROJECT_ASSETS_BUCKET, PROJECT_IMAGES_BUCKET } from "../constants/storage"
import { supabaseAdmin } from "../database/supabase/supabase"
import { IMAGE_UPLOAD_FAILED_MESSAGE, UNKNOWN_IMAGE_URL_MESSAGE } from "../errors/projects"
import type { PaginationQuery } from "../schemas/common/pagination"
import type { ProjectPayloadDTO } from "../schemas/projects/project"
import type { PaginatedList } from "../types/common/pagination"
import type { CreatedId } from "../types/common/serviceResult"
import type { ProjectResult, UploadableFile } from "../types/projects"
import { ProjectErrorCode } from "../types/projects/errorCode"
import type { ProjectRow } from "../types/projects/row"
import type { ProjectUpdateRow } from "../types/projectUpdates/row"
import { isPostgresError } from "../utils/database/isPostgresError"
import { toPaginatedList, toRowRange } from "../utils/pagination"
import { splitHomeProjects } from "../utils/projects/homeProjects"
import {
  invalidateProjectsCache,
  projectDetailCache,
  projectsCountCache,
  projectsListCache,
} from "../utils/projects/projectCache"
import { mapProjectListRow, mapProjectRow } from "../utils/projects/projectMapper"
import { normalizeProjectStatus } from "../utils/projects/projectStatus"
import {
  extractStoragePathFromUrl,
  removeProjectStorage,
  removeStoragePaths,
  uploadProjectImages,
} from "../utils/projects/projectStorage"
import { mapProjectUpdateRow } from "../utils/projectUpdates/projectUpdateMapper"

class ProjectService {
  /** Lista pública paginada no banco */
  async list(pagination: PaginationQuery): Promise<ProjectResult<PaginatedList<Project>>> {
    return this.fetchPage("list", PROJECT_LIST_SELECT, mapProjectListRow, pagination)
  }

  async listFeatured(pagination: PaginationQuery): Promise<ProjectResult<PaginatedList<Project>>> {
    return this.fetchPage("listFeatured", PROJECT_LIST_SELECT, mapProjectListRow, pagination, true)
  }

  /** Lista do admin: com o markdown, que o resumo usa de reserva quando está vazio */
  async listAdmin(pagination: PaginationQuery): Promise<ProjectResult<PaginatedList<Project>>> {
    return this.fetchPage("listAdmin", PROJECT_SELECT, mapProjectRow, pagination)
  }

  /** Projetos públicos já separados em destaque e restante */
  async listHome(): Promise<ProjectResult<HomeProjects>> {
    const result = await this.listAllPublic()
    if (!result.status) return result

    return { status: true, data: splitHomeProjects(result.data) }
  }

  async count(): Promise<ProjectResult<number>> {
    try {
      const cached = projectsCountCache.get(PUBLIC_CACHE_KEY)
      if (cached !== undefined) return { status: true, data: cached }

      const { count, error } = await supabaseAdmin
        .from("projects")
        .select("id", { count: "exact", head: true })

      if (error) {
        console.error("[ProjectService.count]", error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
      }

      const total = count ?? 0
      projectsCountCache.set(PUBLIC_CACHE_KEY, total)

      return { status: true, data: total }
    } catch (error) {
      console.error("[ProjectService.count] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
    }
  }

  async getBySlug(slug: string): Promise<ProjectResult<Project>> {
    try {
      const cached = projectDetailCache.get(slug)
      if (cached) return { status: true, data: cached }

      // Projeto e atualizações numa só consulta (embed pela FK project_updates.project_id)
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(`${PROJECT_SELECT}, project_updates(${PROJECT_UPDATE_SELECT})`)
        .eq("slug", slug)
        .order("published_at", { referencedTable: "project_updates", ascending: false })
        .maybeSingle()

      if (error) {
        console.error("[ProjectService.getBySlug]", error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
      }

      if (!data) return { status: false, error: { code: ProjectErrorCode.PROJECT_NOT_FOUND } }

      const { project_updates: updateRows, ...projectRow } = data
      const project: Project = {
        ...mapProjectRow(projectRow),
        updates: ((updateRows as ProjectUpdateRow[] | null) ?? []).map(mapProjectUpdateRow),
      }

      projectDetailCache.set(slug, project)
      return { status: true, data: project }
    } catch (error) {
      console.error("[ProjectService.getBySlug] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
    }
  }

  async getById(id: string): Promise<ProjectResult<Project>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_SELECT)
        .eq("id", id)
        .maybeSingle()

      if (error) {
        console.error("[ProjectService.getById]", error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
      }

      if (!data) return { status: false, error: { code: ProjectErrorCode.PROJECT_NOT_FOUND } }

      return { status: true, data: mapProjectRow(data) }
    } catch (error) {
      console.error("[ProjectService.getById] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
    }
  }

  async create(
    userId: string,
    payload: ProjectPayloadDTO,
    imageFiles: UploadableFile[]
  ): Promise<ProjectResult<CreatedId>> {
    try {
      // Projeto novo ainda não tem imagens: todas devem vir como arquivo
      const imagesResult = this.ensureKnownImageUrls(payload, [])
      if (!imagesResult.status) return imagesResult

      const slugResult = await this.ensureSlugAvailable(payload.slug)
      if (!slugResult.status) return slugResult

      const created = await this.insertProjectRecord(userId, payload)
      if (!created.status) return created

      if (imageFiles.length > 0) {
        const attached = await this.attachImagesToNewProject(created.data.id, payload, imageFiles)
        if (!attached.status) return attached
      }

      invalidateProjectsCache()
      return created
    } catch (error) {
      console.error("[ProjectService.create] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_CREATE_FAILED } }
    }
  }

  async update(
    id: string,
    payload: ProjectPayloadDTO,
    imageFiles: UploadableFile[]
  ): Promise<ProjectResult<CreatedId>> {
    try {
      const existing = await this.getById(id)
      if (!existing.status) return existing

      const imagesResult = this.ensureKnownImageUrls(payload, existing.data.images)
      if (!imagesResult.status) return imagesResult

      if (existing.data.slug !== payload.slug) {
        const slugResult = await this.ensureSlugAvailable(payload.slug, id)
        if (!slugResult.status) return slugResult
      }

      const updated = await this.updateProjectRecord(id, payload)
      if (!updated.status) return updated

      const finalImages = await this.resolveFinalImages(id, payload, imageFiles)
      if (!finalImages.status) return finalImages

      await this.cleanupRemovedProjectAssets(
        this.collectRemovedImagePaths(existing.data.images, finalImages.data),
        existing.data.markdownFiles.map((file) => file.path)
      )

      invalidateProjectsCache()
      return updated
    } catch (error) {
      console.error("[ProjectService.update] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_UPDATE_FAILED } }
    }
  }

  async remove(id: string): Promise<ProjectResult<null>> {
    try {
      const { data, error } = await supabaseAdmin.from("projects").delete().eq("id", id).select("id")

      if (error) {
        console.error("[ProjectService.remove]", error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_DELETE_FAILED } }
      }

      if (!data || data.length === 0) {
        return { status: false, error: { code: ProjectErrorCode.PROJECT_NOT_FOUND } }
      }

      await removeProjectStorage(id).catch((cleanupError) => {
        console.error("[ProjectService.remove] storage cleanup failed:", cleanupError)
      })

      invalidateProjectsCache()
      return { status: true, data: null }
    } catch (error) {
      console.error("[ProjectService.remove] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_DELETE_FAILED } }
    }
  }

  private async fetchPage(
    context: string,
    columns: string,
    mapRow: (row: ProjectRow) => Project,
    pagination: PaginationQuery,
    featuredOnly = false
  ): Promise<ProjectResult<PaginatedList<Project>>> {
    try {
      const [from, to] = toRowRange(pagination)
      let query = supabaseAdmin.from("projects").select(columns, { count: "exact" })

      if (featuredOnly) query = query.eq("featured", true)

      const { data, error, count } = await query
        .order("updated_at", { ascending: false })
        .range(from, to)
        .returns<ProjectRow[]>()

      if (error) {
        console.error(`[ProjectService.${context}]`, error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
      }

      return { status: true, data: toPaginatedList((data ?? []).map(mapRow), count, pagination) }
    } catch (error) {
      console.error(`[ProjectService.${context}] error:`, error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
    }
  }

  /** Todos os projetos públicos, com cache curto (a home precisa da lista inteira) */
  private async listAllPublic(): Promise<ProjectResult<Project[]>> {
    try {
      const cached = projectsListCache.get(PUBLIC_CACHE_KEY)
      if (cached) return { status: true, data: cached }

      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(PROJECT_LIST_SELECT)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("[ProjectService.listAllPublic]", error)
        return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
      }

      const projects = (data ?? []).map(mapProjectListRow)
      projectsListCache.set(PUBLIC_CACHE_KEY, projects)

      return { status: true, data: projects }
    } catch (error) {
      console.error("[ProjectService.listAllPublic] error:", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED } }
    }
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: string): Promise<ProjectResult<null>> {
    let query = supabaseAdmin.from("projects").select("id").eq("slug", slug)
    if (ignoreId) query = query.neq("id", ignoreId)

    const { data, error } = await query.maybeSingle()

    // Falha na checagem não bloqueia: a constraint UNIQUE do banco ainda recusa duplicado
    if (error) console.error("[ProjectService.ensureSlugAvailable]", error)

    if (data?.id) return { status: false, error: { code: ProjectErrorCode.PROJECT_SLUG_EXISTS } }

    return { status: true, data: null }
  }

  /**
   * O cliente só pode reordenar ou remover imagens que o projeto já tem;
   * imagens novas chegam como arquivo (pending). Sem isso, qualquer URL
   * externa (rastreamento) iria direto para o banco e para as páginas públicas.
   */
  private ensureKnownImageUrls(payload: ProjectPayloadDTO, allowedUrls: string[]): ProjectResult<null> {
    const allowed = new Set(allowedUrls)
    const referenced = [
      ...payload.images,
      ...(payload.imageOrder ?? []).filter((entry): entry is string => typeof entry === "string"),
    ]

    if (referenced.every((url) => allowed.has(url))) return { status: true, data: null }

    return {
      status: false,
      error: { code: ProjectErrorCode.PROJECT_ASSET_INVALID, message: UNKNOWN_IMAGE_URL_MESSAGE },
    }
  }

  private buildProjectFields(payload: ProjectPayloadDTO) {
    return {
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? "",
      content_markdown: payload.contentMarkdown ?? "",
      status: normalizeProjectStatus(payload.status),
      tech_stack: payload.techStack,
      platform: payload.platform,
      repo_url: payload.repoUrl ?? null,
      cover_image_url: payload.images[0] ?? null,
      images: payload.images,
      markdown_files: [],
      featured: payload.featured,
    }
  }

  private async insertProjectRecord(userId: string, payload: ProjectPayloadDTO): Promise<ProjectResult<CreatedId>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        ...this.buildProjectFields(payload),
        created_by: userId,
        ...(payload.updatedAt ? { updated_at: payload.updatedAt } : {}),
      })
      .select("id")
      .single()

    if (isPostgresError(error, PG_UNIQUE_VIOLATION)) {
      return { status: false, error: { code: ProjectErrorCode.PROJECT_SLUG_EXISTS } }
    }

    if (error || !data) {
      console.error("[ProjectService.insertProjectRecord]", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_CREATE_FAILED } }
    }

    return { status: true, data: { id: data.id } }
  }

  private async updateProjectRecord(id: string, payload: ProjectPayloadDTO): Promise<ProjectResult<CreatedId>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({
        ...this.buildProjectFields(payload),
        updated_at: payload.updatedAt ?? new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single()

    if (isPostgresError(error, PG_UNIQUE_VIOLATION)) {
      return { status: false, error: { code: ProjectErrorCode.PROJECT_SLUG_EXISTS } }
    }

    if (error || !data) {
      console.error("[ProjectService.updateProjectRecord]", error)
      return { status: false, error: { code: ProjectErrorCode.PROJECT_UPDATE_FAILED } }
    }

    return { status: true, data: { id: data.id } }
  }

  /** Projeto recém-criado: se o envio das imagens falhar, o projeto é desfeito */
  private async attachImagesToNewProject(
    projectId: string,
    payload: ProjectPayloadDTO,
    imageFiles: UploadableFile[]
  ): Promise<ProjectResult<string[]>> {
    const attached = await this.uploadAndSaveImages(projectId, payload, imageFiles, ProjectErrorCode.PROJECT_CREATE_FAILED)

    if (!attached.status) await this.cleanupCreatedProject(projectId)

    return attached
  }

  /** Imagens que ficam no projeto editado: as mantidas no payload mais as enviadas agora */
  private async resolveFinalImages(
    projectId: string,
    payload: ProjectPayloadDTO,
    imageFiles: UploadableFile[]
  ): Promise<ProjectResult<string[]>> {
    if (imageFiles.length === 0) return { status: true, data: payload.images }

    return this.uploadAndSaveImages(projectId, payload, imageFiles, ProjectErrorCode.PROJECT_UPDATE_FAILED)
  }

  private async uploadAndSaveImages(
    projectId: string,
    payload: ProjectPayloadDTO,
    imageFiles: UploadableFile[],
    failureCode: ProjectErrorCode
  ): Promise<ProjectResult<string[]>> {
    const uploaded = await this.safeUploadImages(projectId, imageFiles, failureCode)
    if (!uploaded.status) return uploaded

    const images = this.resolveOrderedImages(payload, uploaded.data)
    const saved = await this.saveProjectImages(projectId, images, failureCode)

    if (!saved.status) {
      await this.cleanupUploadedImageUrls(uploaded.data)
      return saved
    }

    return { status: true, data: images }
  }

  private async safeUploadImages(
    projectId: string,
    files: UploadableFile[],
    failureCode: ProjectErrorCode
  ): Promise<ProjectResult<string[]>> {
    try {
      return { status: true, data: await uploadProjectImages(projectId, files) }
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_IMAGE_TYPE") {
        return { status: false, error: { code: ProjectErrorCode.PROJECT_ASSET_INVALID } }
      }

      console.error("[ProjectService.safeUploadImages]", error)
      return { status: false, error: { code: failureCode, message: IMAGE_UPLOAD_FAILED_MESSAGE } }
    }
  }

  private resolveOrderedImages(payload: ProjectPayloadDTO, uploadedUrls: string[]): string[] {
    if (!payload.imageOrder?.length) return [...payload.images, ...uploadedUrls]

    return payload.imageOrder
      .map((entry) => (typeof entry === "string" ? entry : uploadedUrls[entry.pending] ?? ""))
      .filter((url) => url.length > 0)
  }

  private async saveProjectImages(
    projectId: string,
    images: string[],
    failureCode: ProjectErrorCode
  ): Promise<ProjectResult<null>> {
    const { error } = await supabaseAdmin
      .from("projects")
      .update({
        cover_image_url: images[0] ?? null,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)

    if (error) {
      console.error("[ProjectService.saveProjectImages]", error)
      return { status: false, error: { code: failureCode } }
    }

    return { status: true, data: null }
  }

  private collectRemovedImagePaths(existingUrls: string[], keptUrls: string[]): string[] {
    return this.toImageStoragePaths(existingUrls.filter((url) => !keptUrls.includes(url)))
  }

  private toImageStoragePaths(urls: string[]): string[] {
    return urls
      .map((url) => extractStoragePathFromUrl(url, PROJECT_IMAGES_BUCKET))
      .filter((path): path is string => path !== null)
  }

  private async cleanupRemovedProjectAssets(removedImagePaths: string[], removedMarkdownPaths: string[]): Promise<void> {
    await Promise.all([
      removeStoragePaths(PROJECT_IMAGES_BUCKET, removedImagePaths).catch((error) => {
        console.error("[ProjectService.cleanupRemovedProjectAssets] image cleanup failed:", error)
      }),
      removeStoragePaths(PROJECT_ASSETS_BUCKET, removedMarkdownPaths).catch((error) => {
        console.error("[ProjectService.cleanupRemovedProjectAssets] markdown cleanup failed:", error)
      }),
    ])
  }

  private async cleanupCreatedProject(projectId: string): Promise<void> {
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("[ProjectService.cleanupCreatedProject]", error)
    }
  }

  private async cleanupUploadedImageUrls(urls: string[]): Promise<void> {
    await removeStoragePaths(PROJECT_IMAGES_BUCKET, this.toImageStoragePaths(urls)).catch((error) => {
      console.error("[ProjectService.cleanupUploadedImageUrls]", error)
    })
  }
}

export default new ProjectService()
