import type { Request } from "express"

type AuthField = "userId" | "accessToken"

/**
 * Lê um campo que o authMiddleware pendura no request. Se faltar, a rota foi montada
 * sem o middleware: é bug do servidor, então lança e o errorHandler responde 500.
 */
export function requireAuthField(
  request: Pick<Request, AuthField | "method" | "originalUrl">,
  field: AuthField,
): string {
  const value = request[field]
  if (!value) {
    throw new Error(`${field} ausente em ${request.method} ${request.originalUrl}: rota sem authMiddleware`)
  }
  return value
}
