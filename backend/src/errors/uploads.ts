import { formatMegabytes } from "@blog/shared"

export interface UploadErrorMessages {
  tooLarge: string
  invalidType: string
  failed: string
  missingFile: string
}

export const INVALID_IMAGE_CONTENT_MESSAGE = "O conteúdo do arquivo não corresponde a uma imagem válida."

/** Erro do multer que o fileFilter levanta para formato não aceito */
export const INVALID_UPLOAD_TYPE_ERROR = "INVALID_UPLOAD_TYPE"

export function buildUploadErrorMessages(maxBytes: number, noun: string, formats: string): UploadErrorMessages {
  return {
    tooLarge: `Cada arquivo deve ter no máximo ${formatMegabytes(maxBytes)}.`,
    invalidType: `Formato inválido. Use ${formats}.`,
    failed: `Não foi possível enviar ${noun}.`,
    missingFile: "Envie um arquivo de imagem no campo image.",
  }
}
