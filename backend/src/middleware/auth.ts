import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { User } from "@supabase/supabase-js"
import { env } from "../config/env"
import { supabaseAdmin } from "../database/supabase/supabase"
import UserService from "../services/UserService"
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "../utils/authCookies"
import { isAccessTokenRevoked, isUserSessionRevoked } from "../utils/tokenRevocation"

type SupabaseJwtPayload = jwt.JwtPayload & {
  sub: string
  email?: string
}

function toAuthUser(payload: SupabaseJwtPayload): User {
  const aud = payload.aud
  return {
    id: payload.sub,
    email: payload.email ?? "",
    aud: Array.isArray(aud) ? aud[0] ?? "authenticated" : aud ?? "authenticated",
    role: payload.role ?? "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "",
  }
}

async function verifyJwtLocally(token: string): Promise<User | null> {
  if (await isAccessTokenRevoked(token)) return null

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    }) as SupabaseJwtPayload

    if (!payload.sub) return null
    if (await isUserSessionRevoked(payload.sub)) return null

    return toAuthUser(payload)
  } catch {
    return null
  }
}

async function resolveUserFromAccessToken(token: string): Promise<User | null> {
  const localUser = await verifyJwtLocally(token)
  if (localUser) return localUser

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  if (await isUserSessionRevoked(data.user.id)) {
    return null
  }

  return data.user
}

async function refreshAccessToken(
  request: Request,
  response: Response
): Promise<string | null> {
  const refreshToken = getRefreshTokenFromCookies(request)

  if (!refreshToken) {
    return null
  }

  const result = await UserService.refresh(refreshToken)

  if (!result.status) {
    return null
  }

  setAuthCookies(response, result.data)
  return result.data.accessToken
}

export async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  let accessToken = getAccessTokenFromCookies(request)

  if (accessToken) {
    const user = await resolveUserFromAccessToken(accessToken)

    if (user) {
      request.user = user
      request.accessToken = accessToken
      next()
      return
    }
  }

  const refreshedToken = await refreshAccessToken(request, response)

  if (!refreshedToken) {
    response.status(401).json({ success: false, message: "Sessão não encontrada." })
    return
  }

  accessToken = refreshedToken

  const user = await resolveUserFromAccessToken(accessToken)

  if (!user) {
    response.status(401).json({ success: false, message: "Token inválido ou expirado" })
    return
  }

  request.user = user
  request.accessToken = accessToken
  next()
}
