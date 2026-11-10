import { FIFTEEN_MINUTES_MS } from "../constants/rateLimit"
import { createRateLimiter } from "../utils/rateLimit/createRateLimiter"

/**
 * Com REDIS_URL: contadores compartilhados entre instâncias.
 * Sem Redis: MemoryStore (reset a cada deploy/restart).
 */
export const rateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 100,
})
