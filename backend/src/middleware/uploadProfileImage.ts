import type { NextFunction, Request, Response } from "express"
import multer from "multer"
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
} from "../constants/profileImage.constants"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PROFILE_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (PROFILE_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof PROFILE_IMAGE_MIME_TYPES)[number])) {
      callback(null, true)
      return
    }

    callback(new Error("INVALID_PROFILE_IMAGE_TYPE"))
  },
})

export function uploadProfileImage(
  request: Request,
  response: Response,
  next: NextFunction
) {
  upload.single("image")(request, response, (error: unknown) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "A imagem deve ter no máximo 2 MB."
          : "Não foi possível processar o arquivo enviado."

      response.status(422).json({ success: false, message })
      return
    }

    if (error instanceof Error && error.message === "INVALID_PROFILE_IMAGE_TYPE") {
      response.status(422).json({
        success: false,
        message: "Formato inválido. Use JPEG, PNG ou WebP.",
      })
      return
    }

    response.status(400).json({
      success: false,
      message: "Não foi possível enviar a imagem.",
    })
  })
}
