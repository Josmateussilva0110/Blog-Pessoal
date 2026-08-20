export type AuthProviderError = {
  message?: string
  code?: string
} | null

export function isRefreshTokenReuseOrRevoked(error: AuthProviderError) {
  if (!error) return false

  const message = (error.message ?? "").toLowerCase()
  const code = (error.code ?? "").toLowerCase()

  return (
    code.includes("refresh_token") ||
    message.includes("already used") ||
    message.includes("not found") ||
    message.includes("invalid refresh")
  )
}

export function mapPasswordUpdateError(message: string | undefined): string {
  const normalized = (message ?? "").toLowerCase()

  if (normalized.includes("different from the old password")) {
    return "A nova senha deve ser diferente da senha atual."
  }

  if (normalized.includes("should be at least") || normalized.includes("weak")) {
    return "A nova senha não atende aos requisitos de segurança."
  }

  return "Não foi possível atualizar a senha."
}
