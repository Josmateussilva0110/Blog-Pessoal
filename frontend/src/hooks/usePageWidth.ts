/**
 * Largura máxima do conteúdo das páginas públicas. A página principal e a de
 * um projeto usam a mesma área larga; header e footer acompanham para o logo
 * e os links continuarem alinhados com o conteúdo.
 */
export function usePageWidthClass() {
  // Mesma largura em todas as rotas: o slide entre as páginas não troca o
  // max-width e o layout não é refeito na navegação
  return "max-w-[88rem]";
}
