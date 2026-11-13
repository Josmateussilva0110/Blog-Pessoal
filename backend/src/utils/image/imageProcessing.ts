import sharp from "sharp"
import {
  PROJECT_IMAGE_MAX_WIDTH,
  PROJECT_THUMB_MAX_WIDTH,
  PROJECT_THUMB_WIDTHS,
} from "@blog/shared"

export const IMAGE_WEBP_QUALITY = 82
export const IMAGE_THUMB_WEBP_QUALITY = 75

export { PROJECT_IMAGE_MAX_WIDTH, PROJECT_THUMB_MAX_WIDTH, PROJECT_THUMB_WIDTHS }
/** Prints têm muito texto: qualidade maior evita artefatos nas letras */
export const PROJECT_THUMB_WEBP_QUALITY = 82
/**
 * Nitidez leve nas miniaturas menores: numa redução forte de print o texto
 * perde contraste, e esse sharpen devolve a legibilidade sem criar halo.
 */
export const PROJECT_THUMB_SHARPEN_SIGMA = 0.6

export const PROFILE_IMAGE_MAX_WIDTH = 800
export const PROFILE_THUMB_MAX_WIDTH = 320

export type ProcessedImage = {
  main: Buffer
  thumb: Buffer
  contentType: "image/webp"
}

async function toWebpVariants(
  buffer: Buffer,
  mainMaxWidth: number,
  thumbMaxWidth: number,
  thumbQuality = IMAGE_THUMB_WEBP_QUALITY,
): Promise<ProcessedImage> {
  const pipeline = sharp(buffer, { animated: false }).rotate()

  const [main, thumb] = await Promise.all([
    pipeline
      .clone()
      .resize({ width: mainMaxWidth, withoutEnlargement: true })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer(),
    pipeline
      .clone()
      .resize({ width: thumbMaxWidth, withoutEnlargement: true })
      .webp({ quality: thumbQuality })
      .toBuffer(),
  ])

  return {
    main,
    thumb,
    contentType: "image/webp",
  }
}

export type ImageVariant = {
  width: number
  buffer: Buffer
}

export type ProcessedProjectImage = {
  main: Buffer
  thumbs: ImageVariant[]
  contentType: "image/webp"
}

/** Abre a imagem enviada uma vez só; principal e miniaturas saem de clones dela */
export function openProjectImage(buffer: Buffer): sharp.Sharp {
  return sharp(buffer, { animated: false }).rotate()
}

/**
 * Miniaturas do projeto em todas as larguras de PROJECT_THUMB_WIDTHS.
 * Usada no upload e no script de regeneração, para os dois gerarem o mesmo arquivo.
 */
export async function processProjectThumbnails(pipeline: sharp.Sharp): Promise<ImageVariant[]> {
  return Promise.all(
    PROJECT_THUMB_WIDTHS.map(async (width) => {
      // Lanczos (padrão do sharp) reduz melhor que o navegador; a maior fica sem
      // sharpen porque só aparece em telas densas, onde a redução é pequena
      let resized = pipeline.clone().resize({ width, withoutEnlargement: true })
      if (width < PROJECT_THUMB_MAX_WIDTH) {
        resized = resized.sharpen({ sigma: PROJECT_THUMB_SHARPEN_SIGMA })
      }

      return {
        width,
        buffer: await resized.webp({ quality: PROJECT_THUMB_WEBP_QUALITY }).toBuffer(),
      }
    }),
  )
}

export async function processProjectImage(buffer: Buffer): Promise<ProcessedProjectImage> {
  const pipeline = openProjectImage(buffer)

  const [main, thumbs] = await Promise.all([
    pipeline
      .clone()
      .resize({ width: PROJECT_IMAGE_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer(),
    processProjectThumbnails(pipeline),
  ])

  return { main, thumbs, contentType: "image/webp" }
}

export async function processProfileImage(buffer: Buffer): Promise<ProcessedImage> {
  return toWebpVariants(buffer, PROFILE_IMAGE_MAX_WIDTH, PROFILE_THUMB_MAX_WIDTH)
}

/**
 * Caminho da miniatura: `.thumb.webp` para a maior largura (nome histórico) e
 * `.thumb.<largura>.webp` para as menores.
 */
export function toThumbnailStoragePath(path: string, width?: number): string {
  if (path.includes(".thumb.")) {
    return path
  }

  const suffix = width === undefined || width === PROJECT_THUMB_MAX_WIDTH ? "" : `.${width}`
  return path.replace(/\.(webp|jpe?g|png|gif)$/i, `.thumb${suffix}.webp`)
}

/** Caminho + miniatura padrão + miniaturas das larguras extras (para apagar tudo junto) */
export function expandStoragePathsWithThumbnails(
  paths: string[],
  widths: readonly number[] = [],
): string[] {
  const expanded = new Set<string>()

  for (const path of paths) {
    expanded.add(path)
    expanded.add(toThumbnailStoragePath(path))
    for (const width of widths) {
      expanded.add(toThumbnailStoragePath(path, width))
    }
  }

  return [...expanded]
}

export function toThumbnailPublicUrl(url: string): string {
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
