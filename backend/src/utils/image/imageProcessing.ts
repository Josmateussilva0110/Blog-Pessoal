import sharp from "sharp"
import { PROJECT_IMAGE_MAX_WIDTH, PROJECT_THUMB_MAX_WIDTH } from "@blog/shared"

export const IMAGE_WEBP_QUALITY = 82
export const IMAGE_THUMB_WEBP_QUALITY = 75

export { PROJECT_IMAGE_MAX_WIDTH, PROJECT_THUMB_MAX_WIDTH }
/** Prints têm muito texto: qualidade maior evita artefatos nas letras */
export const PROJECT_THUMB_WEBP_QUALITY = 82

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

export async function processProjectImage(buffer: Buffer): Promise<ProcessedImage> {
  return toWebpVariants(
    buffer,
    PROJECT_IMAGE_MAX_WIDTH,
    PROJECT_THUMB_MAX_WIDTH,
    PROJECT_THUMB_WEBP_QUALITY,
  )
}

export async function processProfileImage(buffer: Buffer): Promise<ProcessedImage> {
  return toWebpVariants(buffer, PROFILE_IMAGE_MAX_WIDTH, PROFILE_THUMB_MAX_WIDTH)
}

export function toThumbnailStoragePath(path: string): string {
  if (path.includes(".thumb.")) {
    return path
  }

  return path.replace(/\.(webp|jpe?g|png|gif)$/i, ".thumb.webp")
}

export function expandStoragePathsWithThumbnails(paths: string[]): string[] {
  const expanded = new Set<string>()

  for (const path of paths) {
    expanded.add(path)
    expanded.add(toThumbnailStoragePath(path))
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
