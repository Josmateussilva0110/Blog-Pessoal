import type { Request, Response } from "express"
import { PROFILE_IMAGE_REDIRECT_MAX_AGE_SECONDS } from "../constants/http"
import { userErrorHttpStatusMap } from "../errors/users"
import UserService from "../services/UserService"
import { ChangePasswordSchema } from "../schemas/auth/changePassword"
import { LoginSchema } from "../schemas/auth/login"
import { PasswordResetRequestSchema } from "../schemas/auth/passwordResetRequest"
import { UpdateProfileSchema } from "../schemas/users/updateProfile"
import { UserErrorCode } from "../types/users/errorCode"
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "../utils/auth/authCookies"
import { requireAuthField } from "../utils/auth/requireAuthField"
import { setPublicCacheHeaders } from "../utils/http/httpCache"
import { requireValidated } from "../utils/http/requireValidated"
import { sendFailure } from "../utils/http/sendFailure"
import { sendSuccess } from "../utils/http/sendSuccess"

class UserController {
  async login(request: Request, response: Response): Promise<Response> {
    const result = await UserService.login(requireValidated(request, "body", LoginSchema))

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    setAuthCookies(response, result.data.tokens)
    return sendSuccess(response, "Login realizado com sucesso.", { user: result.data.user })
  }

  async logout(request: Request, response: Response): Promise<Response> {
    const accessToken = getAccessTokenFromCookies(request)

    // Os cookies saem de qualquer jeito: falha ao revogar no provedor não prende o usuário logado
    if (accessToken) await UserService.logout(accessToken)

    clearAuthCookies(response)
    return sendSuccess(response, "Logout realizado com sucesso.")
  }

  async refresh(request: Request, response: Response): Promise<Response> {
    const refreshToken = getRefreshTokenFromCookies(request)

    if (!refreshToken) {
      clearAuthCookies(response)
      return sendFailure(response, { code: UserErrorCode.SESSION_EXPIRED }, userErrorHttpStatusMap)
    }

    const result = await UserService.refresh(refreshToken)

    if (!result.status) {
      clearAuthCookies(response)
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    setAuthCookies(response, result.data.tokens)
    return sendSuccess(response, "Sessão renovada com sucesso.", { user: result.data.user })
  }

  async getProfile(request: Request, response: Response): Promise<Response> {
    const result = await UserService.getProfile(requireAuthField(request, "userId"))

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Perfil carregado.", result.data)
  }

  async updateProfile(request: Request, response: Response): Promise<Response> {
    const result = await UserService.updateProfile(
      requireAuthField(request, "userId"),
      requireValidated(request, "body", UpdateProfileSchema)
    )

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Perfil atualizado com sucesso.", result.data)
  }

  async changePassword(request: Request, response: Response): Promise<Response> {
    const result = await UserService.changePassword(
      requireAuthField(request, "userId"),
      requireValidated(request, "body", ChangePasswordSchema)
    )

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Senha atualizada com sucesso.")
  }

  async requestPasswordReset(request: Request, response: Response): Promise<Response> {
    const result = await UserService.requestPasswordReset(requireValidated(request, "body", PasswordResetRequestSchema))

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(
      response,
      "Solicitação enviada. Nossa equipe vai entrar em contato para confirmar sua identidade e liberar o acesso."
    )
  }

  async uploadProfileImage(request: Request, response: Response): Promise<Response> {
    // O middleware uploadProfileImage já recusou a requisição sem arquivo
    const file = request.file as Express.Multer.File
    const result = await UserService.updateProfileImage(requireAuthField(request, "userId"), {
      buffer: file.buffer,
      mimetype: file.mimetype,
    })

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Foto de perfil atualizada com sucesso.", result.data)
  }

  async deleteProfileImage(request: Request, response: Response): Promise<Response> {
    const result = await UserService.deleteProfileImage(requireAuthField(request, "userId"))

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Foto de perfil removida com sucesso.")
  }

  async getPublicProfileImageMeta(_request: Request, response: Response): Promise<Response> {
    const result = await UserService.getPublicProfileImageMeta()

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    return sendSuccess(response, "Foto de perfil carregada.", result.data)
  }

  /** Única rota sem envelope no sucesso: é usada direto em <img src>, então redireciona */
  async getPublicProfileImage(_request: Request, response: Response): Promise<Response | void> {
    const result = await UserService.getPublicProfileImageUrl()

    if (!result.status) return sendFailure(response, result.error, userErrorHttpStatusMap)

    setPublicCacheHeaders(response, PROFILE_IMAGE_REDIRECT_MAX_AGE_SECONDS)
    response.redirect(302, result.data)
  }
}

export default new UserController()
