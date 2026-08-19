import type { Request } from "express"
import type { Express } from "express"
import { projectPayloadSchema } from "../schemas/projectSchema"

type UploadedFile = Express.Multer.File

export function parseProjectPayload(request: Request) {
  const raw = request.body?.data

  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error("MISSING_PAYLOAD")
  }

  return projectPayloadSchema.parse(JSON.parse(raw))
}

export function getUploadedImages(request: Request): UploadedFile[] {
  const files = request.files as Record<string, UploadedFile[]> | undefined
  return files?.images ?? []
}
