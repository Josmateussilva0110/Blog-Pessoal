/** Larguras máximas das imagens de projeto geradas no upload (usadas no processamento e no srcSet) */
export const PROJECT_IMAGE_MAX_WIDTH = 1920;
/** Cobre os cards de projeto (~600px) em telas 1.5x sem precisar do original */
export const PROJECT_THUMB_MAX_WIDTH = 960;
/**
 * Versão das miniaturas de projeto, vai na URL (?v=) para furar o cache do CDN
 * e do navegador. Incrementar sempre que rodar o regenerate-thumbnails.
 */
export const PROJECT_THUMB_VERSION = 2;
