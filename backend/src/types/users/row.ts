export interface UserProfileRow {
  id: string
  username: string
  email: string
  must_change_password: boolean | null
  profile_image_url: string | null
  profile_image_updated_at: string | null
}
