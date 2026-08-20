const IMAGE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF — WEBP marker checked separately
}

function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false

  return signature.every((byte, index) => buffer[index] === byte)
}

function isWebp(buffer: Buffer): boolean {
  return (
    matchesSignature(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
}

export function isSupportedImageBuffer(mimetype: string, buffer: Buffer): boolean {
  if (mimetype === "image/webp") {
    return isWebp(buffer)
  }

  const signatures = IMAGE_SIGNATURES[mimetype]
  if (!signatures) return false

  return signatures.some((signature) => matchesSignature(buffer, signature))
}

export function validateUploadedImage(
  file: Express.Multer.File | undefined,
): string | null {
  if (!file) return null

  if (!isSupportedImageBuffer(file.mimetype, file.buffer)) {
    return "O conteúdo do arquivo não corresponde a uma imagem válida."
  }

  return null
}
