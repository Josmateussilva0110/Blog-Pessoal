import { NextFunction, Request, Response } from "express"
import UserService from "../services/UserService"
import { ForcedChangePasswordSchema } from "../schemas/forcedChangePasswordSchema"
import { UpdatePasswordSchema } from "../schemas/updatePasswordSchema"

export async function validateChangePassword(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const accessToken = request.accessToken

  if (!accessToken) {
    response.status(401).json({ success: false, message: "Sessão não encontrada." })
    return
  }

  const profileResult = await UserService.getProfile(accessToken)

  if (!profileResult.status) {
    response.status(401).json({
      success: false,
      message: profileResult.error.message,
    })
    return
  }

  const mustChangePassword = profileResult.data.must_change_password === true
  const schema = mustChangePassword
    ? ForcedChangePasswordSchema
    : UpdatePasswordSchema

  const result = schema.safeParse(request.body)

  if (!result.success) {
    response.status(422).json({
      success: false,
      message: "Erro de validação",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "body",
        message: issue.message,
      })),
    })
    return
  }

  request.body = result.data
  next()
}
