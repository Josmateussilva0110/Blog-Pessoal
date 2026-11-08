/** Larguras máximas das imagens de projeto geradas no upload (usadas no processamento e no srcSet) */
export const PROJECT_IMAGE_MAX_WIDTH = 1920;
/** Cobre os cards de projeto (~600px) em telas 1.5x sem precisar do original */
export const PROJECT_THUMB_MAX_WIDTH = 960;
/**
 * Versão das miniaturas de projeto, vai na URL (?v=) para furar o cache do CDN
 * e do navegador. Incrementar sempre que rodar o regenerate-thumbnails.
 */
export const PROJECT_THUMB_VERSION = 2;

const MEGABYTE = 1024 * 1024;

/** Foto de perfil: limite e formatos aceitos no upload (validados no backend) */
export const PROFILE_IMAGE_MAX_BYTES = 2 * MEGABYTE;
export const PROFILE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ProfileImageMimeType = (typeof PROFILE_IMAGE_MIME_TYPES)[number];

/** Imagens de projeto: limite por arquivo, quantidade e formatos aceitos no upload */
export const PROJECT_IMAGE_MAX_BYTES = 5 * MEGABYTE;
export const PROJECT_IMAGES_MAX_COUNT = 10;
// Sem GIF: o backend só reconhece a assinatura de JPEG, PNG e WebP (fileSignature.ts)
export const PROJECT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Nomes dos formatos para textos de ajuda ("JPEG, PNG e WebP") */
export const IMAGE_FORMAT_LABELS = "JPEG, PNG e WebP";

/** Tamanho em MB para mensagens ("máx. 2 MB") */
export function formatMegabytes(bytes: number) {
  return `${Math.round((bytes / MEGABYTE) * 10) / 10} MB`;
}
