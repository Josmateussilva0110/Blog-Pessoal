export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024

export const PROFILE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type ProfileImageMimeType = (typeof PROFILE_IMAGE_MIME_TYPES)[number]
