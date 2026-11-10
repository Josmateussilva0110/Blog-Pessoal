import type { Response } from "express"
import type { ZodError } from "zod"
import { commonErrorHttpStatusMap } from "../../errors/common"
import { CommonErrorCode } from "../../types/common/errorCode"
import { sendFailure } from "./sendFailure"

/** 422 com errors[].field: o cliente usa o field para marcar o input na tela */
export function sendValidationError(response: Response, error: ZodError, fallbackField: string) {
  const errors = error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : fallbackField,
    message: issue.message,
  }))

  return sendFailure(
    response,
    { code: CommonErrorCode.VALIDATION_ERROR },
    commonErrorHttpStatusMap,
    errors,
  )
}
