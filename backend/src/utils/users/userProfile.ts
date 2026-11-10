import type { UserProfile } from "../../types/users"
import type { UserProfileRow } from "../../types/users/row"
import { getProfileImagePublicUrl } from "./profileImageStorage"

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username ?? "",
    email: row.email,
    must_change_password: row.must_change_password ?? false,
    has_profile_image: row.profile_image_url !== null,
    profile_image_updated_at: row.profile_image_updated_at,
    profile_image_public_url: row.profile_image_url
      ? getProfileImagePublicUrl(row.profile_image_url, row.profile_image_updated_at)
      : null,
  }
}
