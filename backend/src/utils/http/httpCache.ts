import type { Response } from "express"

export function setPublicCacheHeaders(response: Response, maxAgeSeconds = 300): void {
  response.setHeader("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`)
}
