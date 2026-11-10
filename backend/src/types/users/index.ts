import type { ServiceResult } from "../common/serviceResult"
import type { UserErrorCode } from "./errorCode"

export type { UserProfile } from "@blog/shared"

export type UserResult<T> = ServiceResult<T, UserErrorCode>

export interface PasswordChangeProfile {
  email: string
  must_change_password: boolean | null
}

export interface PublicProfileImageMeta {
  updated_at: string | null
  image_url: string | null
  thumbnail_url: string | null
}

export interface ProfileImageFile {
  buffer: Buffer
  mimetype: string
}
