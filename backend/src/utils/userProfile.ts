import { UserProfile } from "../types/users/profile"

type UserProfileRow = {
  id: string
  username: string
  email: string
  must_change_password: boolean | null
}

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username ?? "",
    email: row.email,
    must_change_password: row.must_change_password ?? false,
  }
}
