import type { MarkdownFile, Project } from "@blog/shared"

export interface ProjectRow {
  id: string
  slug: string
  title: string
  description: string
  content_markdown?: string
  status: Project["status"] | "archived" | "closed"
  platform?: Project["platform"] | null
  tech_stack: string[] | null
  repo_url: string | null
  cover_image_url: string | null
  images: string[] | null
  markdown_files?: MarkdownFile[] | null
  featured: boolean | null
  created_at: string
  updated_at: string
}
