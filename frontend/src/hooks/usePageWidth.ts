import { useLocation } from "react-router-dom";

/**
 * Largura máxima do conteúdo da página. A página de um projeto usa uma área
 * mais larga (galeria e documentação); header e footer acompanham para o
 * logo e os links continuarem alinhados com o conteúdo.
 */
export function usePageWidthClass() {
  const { pathname } = useLocation();
  const wide = pathname.startsWith("/projects/");

  return wide ? "max-w-[88rem] page-width" : "max-w-6xl page-width";
}
