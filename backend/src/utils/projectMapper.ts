import type { MarkdownFile, Project } from "@blog/shared"
import { normalizeProjectStatus } from "./projectStatus"

export const PROJECT_SELECT =
  "id, slug, title, description, content_markdown, status, tech_stack, repo_url, cover_image_url, images, markdown_files, featured, created_at, updated_at"

type ProjectRow = {
  id: string
  slug: string
  title: string
  description: string
  content_markdown: string
  status: Project["status"] | "archived" | "closed"
  tech_stack: string[] | null
  repo_url: string | null
  cover_image_url: string | null
  images: string[] | null
  markdown_files: MarkdownFile[] | null
  featured: boolean | null
  created_at: string
  updated_at: string
}

export function mapProjectRow(row: ProjectRow): Project {
  const images = row.images ?? []
  const coverImage = row.cover_image_url ?? images[0]
  const status = normalizeProjectStatus(row.status)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || row.content_markdown,
    contentMarkdown: row.content_markdown,
    status,
    techStack: row.tech_stack ?? [],
    repoUrl: row.repo_url ?? undefined,
    coverImage,
    images,
    markdownFiles: row.markdown_files ?? [],
    featured: row.featured ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
