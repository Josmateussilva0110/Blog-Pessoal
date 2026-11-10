/**
 * Header exigido pela API em toda requisição que altera dados (proteção contra CSRF).
 * Um formulário de outro site não consegue enviá-lo, e um fetch com ele passa por preflight,
 * que o CORS só libera para as origens permitidas.
 */
export const CSRF_HEADER_NAME = "X-Requested-With";
export const CSRF_HEADER_VALUE = "blog-web";
