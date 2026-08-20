import UserService from "../../services/UserService"
import type { UserProfile } from "../../types/users/profile"

export async function getSessionUser(accessToken: string): Promise<UserProfile | null> {
  const profileResult = await UserService.getProfile(accessToken)
  return profileResult.status ? profileResult.data : null
}
