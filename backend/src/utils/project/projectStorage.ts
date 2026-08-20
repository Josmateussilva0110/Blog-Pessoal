import { randomUUID } from "node:crypto"
import { supabaseAdmin } from "../../database/supabase/supabase"
import type { UploadableFile } from "../../types/projects/uploadableFile"
import {
  expandStoragePathsWithThumbnails,
  processProjectImage,
} from "../image/imageProcessing"

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

export function getStoragePublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function extractStoragePathFromUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

async function uploadBuffer(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  })

  if (error) {
    throw error
  }
}

async function uploadProjectImagePair(
  projectId: string,
  file: { buffer: Buffer; mimetype: string },
): Promise<string> {
  const mime = normalizeImageMime(file.mimetype)

  if (!IMAGE_MIMES.has(mime)) {
    throw new Error("INVALID_IMAGE_TYPE")
  }

  const processed = await processProjectImage(file.buffer)
  const imageId = randomUUID()
  const mainPath = `${projectId}/images/${imageId}.webp`
  const thumbPath = `${projectId}/images/${imageId}.thumb.webp`

  await Promise.all([
    uploadBuffer(PROJECT_IMAGES_BUCKET, mainPath, processed.main, processed.contentType),
    uploadBuffer(PROJECT_IMAGES_BUCKET, thumbPath, processed.thumb, processed.contentType),
  ])

  return getStoragePublicUrl(PROJECT_IMAGES_BUCKET, mainPath)
}

export async function uploadProjectImages(
  projectId: string,
  files: UploadableFile[],
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadProjectImagePair(projectId, file)))
}

export async function listStoragePaths(
  bucket: string,
  prefix: string,
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
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return

  const expandedPaths = expandStoragePathsWithThumbnails(paths)
  const { error } = await supabaseAdmin.storage.from(bucket).remove(expandedPaths)

  if (error) {
    throw error
  }
}

export async function removeProjectStorage(projectId: string): Promise<void> {
  const buckets = [PROJECT_IMAGES_BUCKET, PROJECT_ASSETS_BUCKET]

  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        const paths = await listStoragePaths(bucket, projectId)
        await removeStoragePaths(bucket, paths)
      } catch (error) {
        console.error(`[removeProjectStorage] failed for ${bucket}:`, error)
      }
    }),
  )
}
