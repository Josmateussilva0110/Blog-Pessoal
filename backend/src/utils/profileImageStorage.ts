import { supabaseAdmin } from "../database/supabase/supabase"
import {
  PROFILE_IMAGE_MIME_TYPES,
  type ProfileImageMimeType,
} from "../constants/profileImage.constants"
import {
  expandStoragePathsWithThumbnails,
  processProfileImage,
  toThumbnailStoragePath,
} from "./imageProcessing"

export const PROFILE_IMAGES_BUCKET = "profile-images"

const PROFILE_MAIN_PATH = (userId: string) => `${userId}/avatar.webp`
const PROFILE_THUMB_PATH = (userId: string) => `${userId}/avatar.thumb.webp`

export function buildProfileImagePath(userId: string): string {
  return PROFILE_MAIN_PATH(userId)
}

export function isAllowedProfileImageMime(
  mime: string,
): mime is ProfileImageMimeType {
  return PROFILE_IMAGE_MIME_TYPES.includes(mime as ProfileImageMimeType)
}

export function getProfileImagePublicUrl(
  storagePath: string,
  updatedAt?: string | null,
): string {
  const { data } = supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(storagePath)

  if (!updatedAt) {
    return data.publicUrl
  }

  const url = new URL(data.publicUrl)
  url.searchParams.set("v", updatedAt)
  return url.toString()
}

export function getProfileThumbnailPublicUrl(
  storagePath: string,
  updatedAt?: string | null,
): string {
  return getProfileImagePublicUrl(toThumbnailStoragePath(storagePath), updatedAt)
}

async function uploadBuffer(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw error
  }
}

export async function uploadProfileImageToStorage(
  userId: string,
  buffer: Buffer,
): Promise<string> {
  const processed = await processProfileImage(buffer)
  const mainPath = PROFILE_MAIN_PATH(userId)
  const thumbPath = PROFILE_THUMB_PATH(userId)

  await Promise.all([
    uploadBuffer(mainPath, processed.main, processed.contentType),
    uploadBuffer(thumbPath, processed.thumb, processed.contentType),
  ])

  return mainPath
}

export async function deleteProfileImageFromStorage(
  storagePath: string,
): Promise<void> {
  const paths = expandStoragePathsWithThumbnails([storagePath])
  const { error } = await supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .remove(paths)

  if (error) {
    throw error
  }
}
