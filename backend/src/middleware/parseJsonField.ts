import type { NextFunction, Request, Response } from "express"
import { commonErrorHttpStatusMap } from "../errors/common"
import { CommonErrorCode } from "../types/common/errorCode"
import { sendFailure } from "../utils/http/sendFailure"

const INVALID_FORM_DATA_MESSAGE = "Dados do formulário inválidos."

function parseJsonText(raw: unknown): unknown {
  if (typeof raw !== "string" || raw.trim().length === 0) return undefined

  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/**
 * Formulário multipart manda o payload como JSON num campo de texto. Este middleware
 * troca o corpo pelo JSON já lido, para o validate seguinte validar como qualquer rota.
 */
export const parseJsonField =
  (field: string) =>
  (request: Request, response: Response, next: NextFunction) => {
    const parsed = parseJsonText(request.body?.[field])

    if (parsed === undefined) {
      sendFailure(
        response,
        { code: CommonErrorCode.VALIDATION_ERROR },
        commonErrorHttpStatusMap,
        [{ field, message: INVALID_FORM_DATA_MESSAGE }],
      )
      return
    }

    request.body = parsed
    next()
  }
