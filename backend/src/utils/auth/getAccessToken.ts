import { Request } from "express"

export function getAccessToken(request: Request): string {
  if (!request.accessToken) {
    throw new Error("Access token ausente no contexto da requisição.")
  }

  return request.accessToken
}
