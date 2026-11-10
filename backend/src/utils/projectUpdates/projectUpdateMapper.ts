import type { ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared"
import type { ProjectUpdateRow } from "../../types/projectUpdates/row"

export function mapProjectUpdateRow(row: ProjectUpdateRow): ProjectUpdate {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    version: row.version ?? undefined,
    contentMarkdown: row.content_markdown ?? "",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Payload do formulário -> colunas da tabela project_updates */
export function toProjectUpdateFields(payload: ProjectUpdateFormValues) {
  return {
    title: payload.title,
    version: payload.version ?? null,
    content_markdown: payload.contentMarkdown,
    published_at: new Date(payload.publishedAt).toISOString(),
  }
}
