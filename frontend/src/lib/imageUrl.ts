/**
 * Converte a URL pública da imagem principal na URL da miniatura gerada no upload.
 * Imagens antigas sem miniatura continuam usando a URL original.
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

  return query ? `${thumb}?${query}` : thumb
}
