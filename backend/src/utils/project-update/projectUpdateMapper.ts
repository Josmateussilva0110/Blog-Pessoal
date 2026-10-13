import type { ProjectUpdate } from "@blog/shared"

export const PROJECT_UPDATE_SELECT =
  "id, project_id, title, version, content_markdown, published_at, created_at, updated_at"

export type ProjectUpdateRow = {
  id: string
  project_id: string
  title: string
  version: string | null
  content_markdown: string | null
  published_at: string
  created_at: string
  updated_at: string
}

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
