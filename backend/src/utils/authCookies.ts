import type { CookieOptions, Request, Response } from "express"
import { env } from "../config/env"
import type { AuthTokens } from "../types/auth/auth.types"

export const ACCESS_TOKEN_COOKIE = "blog_at"
export const REFRESH_TOKEN_COOKIE = "blog_rt"

const COOKIE_PATH = "/api"
const REFRESH_MAX_AGE_MS = env.REFRESH_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: Math.max(0, Math.floor(maxAgeMs / 1000)),
  }
}

export function setAuthCookies(response: Response, tokens: AuthTokens): void {
  const accessMaxAge = Math.max(tokens.expiresAt - Date.now(), 60_000)

  response.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    baseCookieOptions(accessMaxAge),
  )

  response.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    baseCookieOptions(REFRESH_MAX_AGE_MS),
  )
}

export function clearAuthCookies(response: Response): void {
  const clearOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
  }

  response.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions)
  response.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions)
}

export function getAccessTokenFromCookies(request: Request): string | undefined {
  const token = request.cookies?.[ACCESS_TOKEN_COOKIE]
  return typeof token === "string" && token.length > 0 ? token : undefined
}

export function getRefreshTokenFromCookies(request: Request): string | undefined {
  const token = request.cookies?.[REFRESH_TOKEN_COOKIE]
  return typeof token === "string" && token.length > 0 ? token : undefined
}

export function toPublicAuthUser(tokens: AuthTokens) {
  return {
    id: tokens.user.id,
    email: tokens.user.email,
  }
}
