import { randomUUID } from "node:crypto"
import { supabaseAdmin } from "../database/supabase/supabase"

export const PROJECT_IMAGES_BUCKET = "project-images"
export const PROJECT_ASSETS_BUCKET = "project-assets"

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

function normalizeImageMime(mime: string): string {
  if (mime === "image/jpg" || mime === "image/pjpeg") {
    return "image/jpeg"
  }

  return mime
}

function getImageExtension(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export function getStoragePublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProjectImages(
  projectId: string,
  files: Array<{ buffer: Buffer; mimetype: string; originalname: string }>
): Promise<string[]> {
  const urls: string[] = []

  for (const file of files) {
    const mime = normalizeImageMime(file.mimetype)

    if (!IMAGE_MIMES.has(mime)) {
      throw new Error("INVALID_IMAGE_TYPE")
    }

    const extension = getImageExtension(mime)
    const storagePath = `${projectId}/images/${randomUUID()}.${extension}`

    const { error } = await supabaseAdmin.storage
      .from(PROJECT_IMAGES_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: mime,
        upsert: false,
      })

    if (error) {
      throw error
    }

    urls.push(getStoragePublicUrl(PROJECT_IMAGES_BUCKET, storagePath))
  }

  return urls
}

export async function listStoragePaths(
  bucket: string,
  prefix: string
): Promise<string[]> {
  const folder = prefix.replace(/\/+$/, "")
  const paths: string[] = []
  const stack = [folder]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue

    const { data, error } = await supabaseAdmin.storage.from(bucket).list(current, {
      limit: 1000,
    })

    if (error) {
      throw error
    }

    for (const item of data ?? []) {
      const fullPath = `${current}/${item.name}`

      if (item.id === null) {
        stack.push(fullPath)
        continue
      }

      paths.push(fullPath)
    }
  }

  return paths
}

export async function removeStoragePaths(
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return

  const { error } = await supabaseAdmin.storage.from(bucket).remove(paths)

  if (error) {
    throw error
  }
}

export async function removeProjectStorage(projectId: string): Promise<void> {
  const buckets = [PROJECT_IMAGES_BUCKET, PROJECT_ASSETS_BUCKET]

  for (const bucket of buckets) {
    try {
      const paths = await listStoragePaths(bucket, projectId)
      await removeStoragePaths(bucket, paths)
    } catch (error) {
      console.error(`[removeProjectStorage] failed for ${bucket}:`, error)
    }
  }
}
