import { randomUUID } from "node:crypto"
import { PROJECT_IMAGE_MIMES } from "../../constants/projects"
import { PROJECT_ASSETS_BUCKET, PROJECT_IMAGES_BUCKET } from "../../constants/storage"
import { supabaseAdmin } from "../../database/supabase/supabase"
import type { UploadableFile } from "../../types/projects/upload"
import {
  expandStoragePathsWithThumbnails,
  processProjectImage,
  PROJECT_THUMB_WIDTHS,
  toThumbnailStoragePath,
} from "../image/imageProcessing"

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

async function uploadProjectImageSet(
  projectId: string,
  file: Pick<UploadableFile, "buffer" | "mimetype">,
): Promise<string> {
  const mime = normalizeImageMime(file.mimetype)

  if (!PROJECT_IMAGE_MIMES.has(mime)) {
    throw new Error("INVALID_IMAGE_TYPE")
  }

  const processed = await processProjectImage(file.buffer)
  const imageId = randomUUID()
  const mainPath = `${projectId}/images/${imageId}.webp`

  await Promise.all([
    uploadBuffer(PROJECT_IMAGES_BUCKET, mainPath, processed.main, processed.contentType),
    ...processed.thumbs.map((thumb) =>
      uploadBuffer(
        PROJECT_IMAGES_BUCKET,
        toThumbnailStoragePath(mainPath, thumb.width),
        thumb.buffer,
        processed.contentType,
      ),
    ),
  ])

  return getStoragePublicUrl(PROJECT_IMAGES_BUCKET, mainPath)
}

export async function uploadProjectImages(
  projectId: string,
  files: UploadableFile[],
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadProjectImageSet(projectId, file)))
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

  const expandedPaths = expandStoragePathsWithThumbnails(paths, PROJECT_THUMB_WIDTHS)
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
