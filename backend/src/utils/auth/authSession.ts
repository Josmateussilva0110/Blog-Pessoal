import type { AuthTokens, ProviderSession, ProviderUser } from "../../types/auth"

export function buildAuthTokens(session: ProviderSession, user: ProviderUser): AuthTokens {
  const expiresAtSec = session.expires_at ?? 0

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: expiresAtSec * 1000,
    user: {
      id: user.id,
      email: user.email ?? "",
    },
  }
}
