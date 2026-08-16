import { Request, Response } from "express"
import UserService from "../services/UserService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { getAccessToken } from "../utils/getAccessToken"
import { sendServiceError } from "../utils/sendServiceError"
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "../utils/authCookies"

async function getSessionUser(accessToken: string) {
  const profileResult = await UserService.getProfile(accessToken)
  return profileResult.status ? profileResult.data : null
}

class UserController {
  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body as { email: string; password: string }
    const result = await UserService.login(email, password)

    if (!result.status) {
      return sendServiceError(response, result.error, userErrorHttpStatusMap)
    }

    setAuthCookies(response, result.data)

    const user = await getSessionUser(result.data.accessToken)

    return response.status(200).json({
      success: true,
      message: "Login Realizado com sucesso",
      data: { user },
    })
  }

  async logout(request: Request, response: Response): Promise<Response> {
    const accessToken = getAccessTokenFromCookies(request)

    if (accessToken) {
      await UserService.logout(accessToken)
    }

    clearAuthCookies(response)

    return response.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    })
  }

  async refresh(request: Request, response: Response): Promise<Response> {
    const refreshToken = getRefreshTokenFromCookies(request)

    if (!refreshToken) {
      clearAuthCookies(response)
      return response.status(401).json({
        success: false,
        message: "Sessão expirada. Faça login novamente.",
      })
    }

    const result = await UserService.refresh(refreshToken)

    if (!result.status) {
      clearAuthCookies(response)
      return sendServiceError(response, result.error, userErrorHttpStatusMap, {
        includeCode: true,
      })
    }

    setAuthCookies(response, result.data)

    const user = await getSessionUser(result.data.accessToken)

    return response.status(200).json({
      success: true,
      message: "Sessão renovada com sucesso.",
      data: { user },
    })
  }

  async getProfile(request: Request, response: Response): Promise<Response> {
    const result = await UserService.getProfile(getAccessToken(request))

    if (!result.status) {
      return sendServiceError(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    })
  }

  async updateProfile(request: Request, response: Response): Promise<Response> {
    const { username } = request.body

    const result = await UserService.updateProfile(getAccessToken(request), { username })

    if (!result.status) {
      return sendServiceError(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Perfil atualizado com sucesso.",
      data: result.data,
    })
  }

  async changePassword(request: Request, response: Response): Promise<Response> {
    const result = await UserService.changePassword(
      getAccessToken(request),
      request.body
    )

    if (!result.status) {
      return sendServiceError(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Senha atualizada com sucesso.",
      data: result.data,
    })
  }

  async requestPasswordReset(request: Request, response: Response): Promise<Response> {
    const result = await UserService.requestPasswordReset(request.body)

    if (!result.status) {
      return sendServiceError(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message:
        "Solicitação enviada. Nossa equipe vai entrar em contato para confirmar sua identidade e liberar o acesso.",
    })
  }

}

export default new UserController()
