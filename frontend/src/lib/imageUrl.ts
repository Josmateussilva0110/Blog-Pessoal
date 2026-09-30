import { PROJECT_THUMB_VERSION } from "@blog/shared/constants"

/**
 * Converte a URL pública da imagem principal na URL da miniatura gerada no upload.
 * Imagens antigas sem miniatura continuam usando a URL original.
 * A versão na query faz miniaturas regeneradas (mesmo caminho) não virem do cache.
 */
export function getThumbnailUrl(url: string): string {
  if (!url || url.includes(".thumb.")) {
    return url
  }

  const [withoutQuery, query] = url.split("?")
  const thumb = withoutQuery.replace(/\.(webp|jpe?g|png|gif)$/i, ".thumb.webp")

  if (thumb === withoutQuery) {
    return url
  }

  const params = new URLSearchParams(query)
  params.set("v", String(PROJECT_THUMB_VERSION))
  return `${thumb}?${params}`
}
