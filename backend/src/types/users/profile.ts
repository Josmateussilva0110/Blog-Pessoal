export interface UserProfile {
    id: string
    username: string
    email: string
    must_change_password: boolean
    has_profile_image: boolean
    profile_image_updated_at: string | null
    profile_image_public_url: string | null
}
