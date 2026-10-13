import type { ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared"
import { supabaseAdmin } from "../database/supabase/supabase"
import {
  PROJECT_UPDATE_SELECT,
  mapProjectUpdateRow,
  type ProjectUpdateRow,
} from "../utils/project-update/projectUpdateMapper"
import { invalidateProjectsCache } from "../utils/project/projectCache"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ProjectUpdateErrorCode } from "../types/code/projectUpdateCode"

type Result<T> = ServiceResult<T, ProjectUpdateErrorCode>

function fail<T>(code: ProjectUpdateErrorCode, message: string): Result<T> {
  return { status: false, error: { code, message } }
}

function toUpdateFields(payload: ProjectUpdateFormValues) {
  return {
    title: payload.title,
    version: payload.version ?? null,
    content_markdown: payload.contentMarkdown,
    published_at: new Date(payload.publishedAt).toISOString(),
  }
}

class ProjectUpdateService {
  /** Atualizações do projeto, da mais recente para a mais antiga */
  async listByProject(projectId: string): Promise<Result<ProjectUpdate[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .select(PROJECT_UPDATE_SELECT)
        .eq("project_id", projectId)
        .order("published_at", { ascending: false })

      if (error) {
        console.error("[ProjectUpdateService.listByProject]", error)
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED,
          "Erro ao carregar atualizações do projeto."
        )
      }

      return {
        status: true,
        data: ((data as ProjectUpdateRow[] | null) ?? []).map(mapProjectUpdateRow),
      }
    } catch (error) {
      console.error("[ProjectUpdateService.listByProject] error:", error)
      return fail(
        ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED,
        "Erro ao carregar atualizações do projeto."
      )
    }
  }

  async create(
    projectId: string,
    payload: ProjectUpdateFormValues
  ): Promise<Result<ProjectUpdate>> {
    try {
      const projectResult = await this.ensureProjectExists(projectId)
      if (!projectResult.status) return projectResult

      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .insert({ project_id: projectId, ...toUpdateFields(payload) })
        .select(PROJECT_UPDATE_SELECT)
        .single()

      if (error || !data) {
        console.error("[ProjectUpdateService.create]", error)
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED,
          "Não foi possível salvar a atualização."
        )
      }

      invalidateProjectsCache()
      return { status: true, data: mapProjectUpdateRow(data as ProjectUpdateRow) }
    } catch (error) {
      console.error("[ProjectUpdateService.create] error:", error)
      return fail(
        ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED,
        "Erro ao salvar a atualização."
      )
    }
  }

  async update(
    projectId: string,
    updateId: string,
    payload: ProjectUpdateFormValues
  ): Promise<Result<ProjectUpdate>> {
    try {
      // Filtra também pelo projeto: o id da atualização precisa pertencer a ele
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .update({ ...toUpdateFields(payload), updated_at: new Date().toISOString() })
        .eq("id", updateId)
        .eq("project_id", projectId)
        .select(PROJECT_UPDATE_SELECT)
        .maybeSingle()

      if (error) {
        console.error("[ProjectUpdateService.update]", error)
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED,
          "Não foi possível salvar a atualização."
        )
      }

      if (!data) {
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND,
          "Atualização não encontrada."
        )
      }

      invalidateProjectsCache()
      return { status: true, data: mapProjectUpdateRow(data as ProjectUpdateRow) }
    } catch (error) {
      console.error("[ProjectUpdateService.update] error:", error)
      return fail(
        ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED,
        "Erro ao salvar a atualização."
      )
    }
  }

  async remove(projectId: string, updateId: string): Promise<Result<null>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("project_updates")
        .delete()
        .eq("id", updateId)
        .eq("project_id", projectId)
        .select("id")

      if (error) {
        console.error("[ProjectUpdateService.remove]", error)
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED,
          "Não foi possível excluir a atualização."
        )
      }

      if (!data || data.length === 0) {
        return fail(
          ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND,
          "Atualização não encontrada."
        )
      }

      invalidateProjectsCache()
      return { status: true, data: null }
    } catch (error) {
      console.error("[ProjectUpdateService.remove] error:", error)
      return fail(
        ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED,
        "Erro ao excluir a atualização."
      )
    }
  }

  private async ensureProjectExists(projectId: string): Promise<Result<null>> {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .maybeSingle()

    if (error || !data) {
      return fail(ProjectUpdateErrorCode.PROJECT_NOT_FOUND, "Projeto não encontrado.")
    }

    return { status: true, data: null }
  }
}

export default new ProjectUpdateService()
