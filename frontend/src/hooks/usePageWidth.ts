import { useLocation } from "react-router-dom";
import { isProjectDetailPath } from "@/config/routes";

/**
 * Largura máxima do conteúdo da página. A página de um projeto usa uma área
 * mais larga (galeria e documentação); header e footer acompanham para o
 * logo e os links continuarem alinhados com o conteúdo.
 */
export function usePageWidthClass() {
  const { pathname } = useLocation();
  const wide = isProjectDetailPath(pathname);

  // Troca sem transição: animar max-width refaz o layout da página a cada
  // frame, e o slide entre as páginas já disfarça a mudança
  return wide ? "max-w-[88rem]" : "max-w-6xl";
}
