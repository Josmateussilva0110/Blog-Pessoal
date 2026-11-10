import type { ProjectUpdate } from "@blog/shared"
import { PG_FOREIGN_KEY_VIOLATION } from "../constants/postgres"
import { PROJECT_UPDATE_SELECT } from "../constants/projectUpdates"
import { supabaseAdmin } from "../database/supabase/supabase"
import type { PaginationQuery } from "../schemas/common/pagination"
import type { ProjectUpdatePayloadDTO } from "../schemas/projectUpdates/projectUpdate"
import type { PaginatedList } from "../types/common/pagination"
import type { CreatedId } from "../types/common/serviceResult"
import type { ProjectUpdateResult } from "../types/projectUpdates"
import { ProjectUpdateErrorCode } from "../types/projectUpdates/errorCode"
import type { ProjectUpdateRow } from "../types/projectUpdates/row"
import { isPostgresError } from "../utils/database/isPostgresError"
import { toPaginatedList, toRowRange } from "../utils/pagination"
import { invalidateProjectsCache } from "../utils/projects/projectCache"
import { mapProjectUpdateRow, toProjectUpdateFields } from "../utils/projectUpdates/projectUpdateMapper"

class ProjectUpdateService {
  /** Atualizações do projeto, da mais recente para a mais antiga */
  async listByProject(
    projectId: string,
    pagination: PaginationQuery
  ): Promise<ProjectUpdateResult<PaginatedList<ProjectUpdate>>> {
    try {
      const [from, to] = toRowRange(pagination)

      const { data, error, count } = await supabaseAdmin
        .from("project_updates")
        .select(PROJECT_UPDATE_SELECT, { count: "exact" })
        .eq("project_id", projectId)
        .order("published_at", { ascending: false })
        .range(from, to)
        .returns<ProjectUpdateRow[]>()

      if (error) {
        console.error("[ProjectUpdateService.listByProject]", error)
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED } }
      }

      return { status: true, data: toPaginatedList((data ?? []).map(mapProjectUpdateRow), count, pagination) }
    } catch (error) {
      console.error("[ProjectUpdateService.listByProject] error:", error)
      return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED } }
    }
  }

  async create(projectId: string, payload: ProjectUpdatePayloadDTO): Promise<ProjectUpdateResult<CreatedId>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .insert({ project_id: projectId, ...toProjectUpdateFields(payload) })
        .select("id")
        .single()

      // A FK para projects recusa o insert quando o projeto não existe
      if (isPostgresError(error, PG_FOREIGN_KEY_VIOLATION)) {
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_NOT_FOUND } }
      }

      if (error || !data) {
        console.error("[ProjectUpdateService.create]", error)
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } }
      }

      invalidateProjectsCache()
      return { status: true, data: { id: data.id } }
    } catch (error) {
      console.error("[ProjectUpdateService.create] error:", error)
      return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } }
    }
  }

  async update(
    projectId: string,
    updateId: string,
    payload: ProjectUpdatePayloadDTO
  ): Promise<ProjectUpdateResult<CreatedId>> {
    try {
      // Filtra também pelo projeto: o id da atualização precisa pertencer a ele
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .update({ ...toProjectUpdateFields(payload), updated_at: new Date().toISOString() })
        .eq("id", updateId)
        .eq("project_id", projectId)
        .select("id")
        .maybeSingle()

      if (error) {
        console.error("[ProjectUpdateService.update]", error)
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } }
      }

      if (!data) return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND } }

      invalidateProjectsCache()
      return { status: true, data: { id: data.id } }
    } catch (error) {
      console.error("[ProjectUpdateService.update] error:", error)
      return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } }
    }
  }

  async remove(projectId: string, updateId: string): Promise<ProjectUpdateResult<null>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .delete()
        .eq("id", updateId)
        .eq("project_id", projectId)
        .select("id")

      if (error) {
        console.error("[ProjectUpdateService.remove]", error)
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED } }
      }

      if (!data || data.length === 0) {
        return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND } }
      }

      invalidateProjectsCache()
      return { status: true, data: null }
    } catch (error) {
      console.error("[ProjectUpdateService.remove] error:", error)
      return { status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED } }
    }
  }
}

export default new ProjectUpdateService()
