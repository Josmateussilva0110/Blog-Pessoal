import type { NextFunction, Request, Response } from "express"

/** Tempo curto: edições e exclusões no admin aparecem no site em até ~1,5 min */
const PUBLIC_MAX_AGE_SECONDS = 60
const PUBLIC_STALE_WHILE_REVALIDATE_SECONDS = 30

/**
 * Padrão da API: nada é cacheado. Só as rotas públicas que não variam por
 * usuário liberam cache com setPublicCacheHeaders, então uma resposta
 * autenticada nunca fica guardada em CDN/proxy por engano.
 */
export function noStoreByDefault(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader("Cache-Control", "no-store")
  next()
}

/** Só para respostas iguais para todos os visitantes (sem dados de sessão) */
export function setPublicCacheHeaders(
  response: Response,
  maxAgeSeconds = PUBLIC_MAX_AGE_SECONDS,
): void {
  response.setHeader(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${PUBLIC_STALE_WHILE_REVALIDATE_SECONDS}`,
  )
}
