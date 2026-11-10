import type { Request } from "express"

/** Arquivos do campo "images" que o multer (upload.fields) deixou no request */
export function getUploadedImages(request: Request): Express.Multer.File[] {
  const files = request.files as Record<string, Express.Multer.File[]> | undefined
  return files?.images ?? []
}
