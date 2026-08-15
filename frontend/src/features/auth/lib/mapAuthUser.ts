import type { AuthUser, UserProfile } from "@/service";

export function mapAuthUser(profile: UserProfile | null): AuthUser | null {
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    mustChangePassword: profile.must_change_password,
  };
}
