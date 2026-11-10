import type { UserProfile } from "@blog/shared"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string | undefined
  }
}

/** Login e refresh: tokens para os cookies e o perfil que vai para o cliente */
export interface AuthSession {
  tokens: AuthTokens
  user: UserProfile | null
}

export interface ProviderSession {
  access_token: string
  refresh_token: string
  expires_at?: number
}

export interface ProviderUser {
  id: string
  email?: string | null
}

export type AuthProviderError = {
  message?: string
  code?: string
} | null
