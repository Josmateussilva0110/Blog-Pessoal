import {
  PROJECT_IMAGE_MAX_WIDTH,
  PROJECT_THUMB_MAX_WIDTH,
  PROJECT_THUMB_VERSION,
  PROJECT_THUMB_WIDTHS,
} from "@blog/shared/constants"

const IMAGE_EXTENSION = /\.(webp|jpe?g|png|gif)$/i

type ProjectThumbWidth = (typeof PROJECT_THUMB_WIDTHS)[number]

/**
 * Converte a URL pública da imagem principal na URL da miniatura gerada no upload:
 * `.thumb.webp` para a maior largura e `.thumb.<largura>.webp` para as menores.
 * Imagens antigas sem miniatura continuam usando a URL original.
 * A versão na query faz miniaturas regeneradas (mesmo caminho) não virem do cache.
 */
export function getThumbnailUrl(url: string, width: ProjectThumbWidth = PROJECT_THUMB_MAX_WIDTH): string {
  if (!url || url.includes(".thumb.")) {
    return url
  }

  const [withoutQuery, query] = url.split("?")
  const suffix = width === PROJECT_THUMB_MAX_WIDTH ? "" : `.${width}`
  const thumb = withoutQuery.replace(IMAGE_EXTENSION, `.thumb${suffix}.webp`)

  if (thumb === withoutQuery) {
    return url
  }

  const params = new URLSearchParams(query)
  params.set("v", String(PROJECT_THUMB_VERSION))
  return `${thumb}?${params}`
}

/**
 * `srcSet` com todas as miniaturas e o original: com `sizes` certo o navegador
 * baixa a largura mais próxima da exibida vezes a densidade da tela, e os prints
 * chegam já reduzidos no servidor (nítidos) em vez de reduzidos pelo navegador.
 * `undefined` quando a imagem não tem miniatura.
 */
export function getThumbnailSrcSet(url: string): string | undefined {
  if (getThumbnailUrl(url) === url) {
    return undefined
  }

  const candidates = PROJECT_THUMB_WIDTHS.map((width) => `${getThumbnailUrl(url, width)} ${width}w`)
  return [...candidates, `${url} ${PROJECT_IMAGE_MAX_WIDTH}w`].join(", ")
}
