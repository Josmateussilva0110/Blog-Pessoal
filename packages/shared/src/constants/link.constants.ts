/**
 * Link aceito no site: caminho interno ("/#projetos"), http(s) ou mailto. Caminho interno
 * sem "//" nem "/\\" (o navegador trata "\\" como "/" e viraria outro domínio) e sem
 * espaços ou caracteres de controle, que o parser de URL descarta.
 */
export const SAFE_HREF_PATTERN = /^(\/(?![/\\])[^\s\\]*$|https?:\/\/|mailto:)/i;

export function isSafeHref(href: string | undefined): href is string {
  return href !== undefined && SAFE_HREF_PATTERN.test(href.trim());
}
