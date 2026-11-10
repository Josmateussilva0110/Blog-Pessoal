import type { NextFunction, Request, RequestHandler, Response } from "express"
import multer from "multer"
import {
  INVALID_IMAGE_CONTENT_MESSAGE,
  INVALID_UPLOAD_TYPE_ERROR,
  type UploadErrorMessages,
} from "../../errors/uploads"
import { CommonErrorCode } from "../../types/common/errorCode"
import { isSupportedImageBuffer } from "../image/fileSignature"
import { sendCommonFailure } from "./sendCommonFailure"

interface RunUploadOptions {
  messages: UploadErrorMessages
  /** Recusa a requisição quando nenhum arquivo foi enviado */
  requireFile?: boolean
}

function collectUploadedFiles(request: Request): Express.Multer.File[] {
  if (request.file) return [request.file]
  if (!request.files) return []
  return Array.isArray(request.files) ? request.files : Object.values(request.files).flat()
}

function uploadErrorMessage(error: unknown, messages: UploadErrorMessages): string {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return messages.tooLarge
  if (error instanceof Error && error.message === INVALID_UPLOAD_TYPE_ERROR) return messages.invalidType
  return messages.failed
}

/**
 * Roda o multer e responde no envelope: erro do multer, arquivo ausente ou conteúdo
 * que não bate com a assinatura de imagem viram 422 com code INVALID_UPLOAD.
 */
export function runUpload(upload: RequestHandler, { messages, requireFile = false }: RunUploadOptions): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    upload(request, response, (error?: unknown) => {
      if (error) {
        sendCommonFailure(response, CommonErrorCode.INVALID_UPLOAD, uploadErrorMessage(error, messages))
        return
      }

      const files = collectUploadedFiles(request)

      if (requireFile && files.length === 0) {
        sendCommonFailure(response, CommonErrorCode.INVALID_UPLOAD, messages.missingFile)
        return
      }

      if (files.some((file) => !isSupportedImageBuffer(file.mimetype, file.buffer))) {
        sendCommonFailure(response, CommonErrorCode.INVALID_UPLOAD, INVALID_IMAGE_CONTENT_MESSAGE)
        return
      }

      next()
    })
  }
}
