import type { NextFunction, Request, Response } from "express"
import multer from "multer"
import { validateUploadedImage } from "../utils/fileSignature"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 20,
  },
})

export const uploadProjectFiles = upload.fields([
  { name: "images", maxCount: 10 },
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
          ? "Cada arquivo deve ter no máximo 5 MB."
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
