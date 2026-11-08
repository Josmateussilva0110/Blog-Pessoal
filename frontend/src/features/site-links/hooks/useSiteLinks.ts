import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SiteLink, SiteLinksGrouped, UpdateSiteLinksInput } from "@blog/shared";
import { isSafeHref } from "@blog/shared/constants";
import { siteLinksService, unwrap } from "@/service";

export const siteLinkKeys = {
  all: ["site-links"] as const,
};

export function useSiteLinks() {
  return useQuery({
    queryKey: siteLinkKeys.all,
    // Falha vira erro da query: quem consome decide o fallback (o form do admin não pode
    // carregar valores padrão e sobrescrever os links reais ao salvar)
    queryFn: async (): Promise<SiteLinksGrouped> => unwrap(await siteLinksService.list()),
  });
}

/** Link com href fora do padrão (gravado antes da validação): sem href, ou fora da lista */
function sanitizeLinks(links: SiteLink[], hrefRequired: boolean): SiteLink[] {
  return links.flatMap((link) => {
    if (isSafeHref(link.href)) return [link];
    return hrefRequired ? [] : [{ ...link, href: undefined }];
  });
}

/**
 * Links para o site público. Defesa extra além do schema de entrada: o href vai direto
 * para <a href>, então nada fora de "/...", http(s) ou mailto é renderizado.
 */
export function usePublicSiteLinks() {
  return useQuery({
    queryKey: siteLinkKeys.all,
    queryFn: async (): Promise<SiteLinksGrouped> => unwrap(await siteLinksService.list()),
    select: (data): SiteLinksGrouped => ({
      nav: sanitizeLinks(data.nav, true),
      social: sanitizeLinks(data.social, true),
      skill: sanitizeLinks(data.skill, false),
    }),
  });
}

export function useUpdateSiteLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSiteLinksInput) =>
      unwrap(await siteLinksService.update(payload)),
    onSuccess: (data) => {
      queryClient.setQueryData(siteLinkKeys.all, data);
    },
  });
}
