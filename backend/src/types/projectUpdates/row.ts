export interface ProjectUpdateRow {
  id: string
  project_id: string
  title: string
  version: string | null
  content_markdown: string | null
  published_at: string
  created_at: string
  updated_at: string
}
