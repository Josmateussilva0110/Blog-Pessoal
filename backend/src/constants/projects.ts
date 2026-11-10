export const PROJECT_SELECT =
  "id, slug, title, description, content_markdown, status, platform, tech_stack, repo_url, cover_image_url, images, markdown_files, featured, created_at, updated_at"

/** Sem o markdown: as listas não exibem o conteúdo completo */
export const PROJECT_LIST_SELECT =
  "id, slug, title, description, status, platform, tech_stack, repo_url, cover_image_url, images, featured, created_at, updated_at"

/** Quantos projetos recentes vão para o destaque quando nenhum está marcado */
export const HOME_RECENT_SPOTLIGHT_SIZE = 3

export const PROJECT_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
])
