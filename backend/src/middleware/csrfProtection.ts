import type { NextFunction, Request, Response } from "express"
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@blog/shared"
import { SAFE_HTTP_METHODS } from "../constants/http"
import { CommonErrorCode } from "../types/common/errorCode"
import { isAllowedCorsOrigin } from "../utils/http/corsOrigins"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"

/**
 * CSRF: o cookie de sessão é SameSite=None em produção (front e API em domínios diferentes),
 * então o navegador o envia até em formulários de outros sites. Toda requisição que altera
 * dados precisa do header próprio do frontend e, se o navegador informar a origem, ela tem
 * que ser uma das permitidas no CORS (o CORS sozinho só bloqueia a leitura da resposta).
 */
export function csrfProtection(request: Request, response: Response, next: NextFunction) {
  if (SAFE_HTTP_METHODS.has(request.method)) {
    next()
    return
  }

  const origin = request.get("Origin")
  // Sem Origin, o navegador ainda informa se a requisição veio de outro site
  const isCrossSiteWithoutOrigin = !origin && request.get("Sec-Fetch-Site") === "cross-site"

  if (
    request.get(CSRF_HEADER_NAME) !== CSRF_HEADER_VALUE ||
    !isAllowedCorsOrigin(origin) ||
    isCrossSiteWithoutOrigin
  ) {
    sendCommonFailure(response, CommonErrorCode.CSRF_REJECTED)
    return
  }

  next()
}
