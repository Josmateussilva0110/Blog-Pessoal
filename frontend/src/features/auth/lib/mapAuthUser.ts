import type { AuthUser, UserProfile } from "@/service";

export function mapAuthUser(profile: UserProfile | null): AuthUser | null {
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    mustChangePassword: profile.must_change_password,
    hasProfileImage: profile.has_profile_image,
    profileImageUpdatedAt: profile.profile_image_updated_at,
    profileImagePublicUrl: profile.profile_image_public_url,
  };
}
