import type { Project } from "@blog/shared"
import type { ProjectRow } from "../../types/projects/row"
import { normalizeProjectStatus } from "./projectStatus"

export function mapProjectRow(row: ProjectRow): Project {
  const images = row.images ?? []
  const contentMarkdown = row.content_markdown ?? ""

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || contentMarkdown,
    contentMarkdown,
    status: normalizeProjectStatus(row.status),
    platform: row.platform === "mobile" ? "mobile" : "web",
    techStack: row.tech_stack ?? [],
    repoUrl: row.repo_url ?? undefined,
    coverImage: row.cover_image_url ?? images[0],
    images,
    markdownFiles: row.markdown_files ?? [],
    featured: row.featured ?? false,
    updates: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapProjectListRow(row: ProjectRow): Project {
  return mapProjectRow({
    ...row,
    content_markdown: "",
    markdown_files: [],
  })
}
