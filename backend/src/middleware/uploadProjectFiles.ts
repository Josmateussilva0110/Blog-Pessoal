import type { NextFunction, Request, Response } from "express"
import multer from "multer"
import { formatMegabytes, PROJECT_IMAGE_MAX_BYTES, PROJECT_IMAGES_MAX_COUNT } from "@blog/shared"
import { validateUploadedImage } from "../utils/image/fileSignature"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PROJECT_IMAGE_MAX_BYTES,
    files: PROJECT_IMAGES_MAX_COUNT,
  },
})

export const uploadProjectFiles = upload.fields([
  { name: "images", maxCount: PROJECT_IMAGES_MAX_COUNT },
])

export function handleProjectUpload(
  request: Request,
  response: Response,
  next: NextFunction
) {
  uploadProjectFiles(request, response, (error: unknown) => {
    if (!error) {
      const files = request.files as { images?: Express.Multer.File[] } | undefined
      const images = files?.images ?? []

      for (const file of images) {
        const validationError = validateUploadedImage(file)
        if (validationError) {
          response.status(422).json({ success: false, message: validationError })
          return
        }
      }

      next()
      return
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? `Cada arquivo deve ter no máximo ${formatMegabytes(PROJECT_IMAGE_MAX_BYTES)}.`
          : "Não foi possível processar os arquivos enviados."

      response.status(422).json({ success: false, message })
      return
    }

    response.status(400).json({
      success: false,
      message: "Não foi possível enviar os arquivos.",
    })
  })
}
