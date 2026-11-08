import type { NextFunction, Request, Response } from "express"
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@blog/shared"
import { isAllowedCorsOrigin } from "../utils/http/corsOrigins"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

function reject(response: Response) {
  response.status(403).json({
    success: false,
    code: "CSRF_REJECTED",
    message: "Requisição recusada por segurança. Recarregue a página e tente novamente.",
  })
}

/**
 * CSRF: o cookie de sessão é SameSite=None em produção (front e API em domínios diferentes),
 * então o navegador o envia até em formulários de outros sites. Toda requisição que altera
 * dados precisa do header próprio do frontend e, se o navegador informar a origem, ela tem
 * que ser uma das permitidas no CORS (o CORS sozinho só bloqueia a leitura da resposta).
 */
export function csrfProtection(request: Request, response: Response, next: NextFunction) {
  if (SAFE_METHODS.has(request.method)) {
    next()
    return
  }

  if (request.get(CSRF_HEADER_NAME) !== CSRF_HEADER_VALUE) {
    reject(response)
    return
  }

  const origin = request.get("Origin")

  if (!isAllowedCorsOrigin(origin)) {
    reject(response)
    return
  }

  // Sem Origin, o navegador ainda informa se a requisição veio de outro site
  if (!origin && request.get("Sec-Fetch-Site") === "cross-site") {
    reject(response)
    return
  }

  next()
}
