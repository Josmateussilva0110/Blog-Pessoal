import { supabaseAdmin } from "../database/supabase/supabase"
import {
  PROFILE_IMAGE_MIME_TYPES,
  type ProfileImageMimeType,
} from "../constants/profileImage.constants"

export const PROFILE_IMAGES_BUCKET = "profile-images"

function getExtension(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "jpg"
  }
}

export function buildProfileImagePath(userId: string, mime: string): string {
  return `${userId}/avatar.${getExtension(mime)}`
}

export function isAllowedProfileImageMime(
  mime: string
): mime is ProfileImageMimeType {
  return PROFILE_IMAGE_MIME_TYPES.includes(mime as ProfileImageMimeType)
}

export function getProfileImagePublicUrl(
  storagePath: string,
  updatedAt?: string | null
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

export async function uploadProfileImageToStorage(
  userId: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  const storagePath = buildProfileImagePath(userId, mime)

  const { error } = await supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mime,
      upsert: true,
    })

  if (error) {
    throw error
  }

  return storagePath
}

export async function deleteProfileImageFromStorage(
  storagePath: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .remove([storagePath])

  if (error) {
    throw error
  }
}
