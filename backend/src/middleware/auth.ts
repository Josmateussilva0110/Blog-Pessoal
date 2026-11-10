import type { NextFunction, Request, Response } from "express"
import UserService from "../services/UserService"
import { CommonErrorCode } from "../types/common/errorCode"
import { resolveActiveUserId } from "../utils/auth/accessToken"
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "../utils/auth/authCookies"
import { isAdminUser } from "../utils/auth/isAdminUser"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"

interface RequestSession {
  userId: string
  accessToken: string
}

async function sessionFromToken(accessToken: string | undefined): Promise<RequestSession | null> {
  if (!accessToken) return null

  const userId = await resolveActiveUserId(accessToken)
  return userId ? { userId, accessToken } : null
}

/** Access token vencido: renova com o refresh token do cookie e grava os cookies novos */
async function sessionFromRefresh(request: Request, response: Response): Promise<RequestSession | null> {
  const refreshToken = getRefreshTokenFromCookies(request)
  if (!refreshToken) return null

  const result = await UserService.renewTokens(refreshToken)
  if (!result.status) return null

  setAuthCookies(response, result.data)
  return sessionFromToken(result.data.accessToken)
}

export async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const session =
    (await sessionFromToken(getAccessTokenFromCookies(request))) ??
    (await sessionFromRefresh(request, response))

  if (!session) {
    sendCommonFailure(response, CommonErrorCode.UNAUTHORIZED)
    return
  }

  if (!isAdminUser(session.userId)) {
    sendCommonFailure(response, CommonErrorCode.FORBIDDEN)
    return
  }

  request.userId = session.userId
  request.accessToken = session.accessToken
  next()
}
