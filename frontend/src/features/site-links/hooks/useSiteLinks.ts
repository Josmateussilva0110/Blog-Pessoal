import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SiteLinksGrouped, UpdateSiteLinksInput } from "@blog/shared";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { siteLinksService } from "@/service/siteLinks.service";

export const siteLinkKeys = {
  all: ["site-links"] as const,
};

function unwrapSiteLinks(data: SiteLinksGrouped | undefined): SiteLinksGrouped {
  if (!data) return DEFAULT_SITE_LINKS;
  return data;
}

export function useSiteLinks() {
  return useQuery({
    queryKey: siteLinkKeys.all,
    queryFn: async () => {
      const result = await siteLinksService.list();

      if (!result.success || !result.data) {
        return DEFAULT_SITE_LINKS;
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSiteLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSiteLinksInput) => {
      const result = await siteLinksService.update(payload);

      if (!result.success) {
        throw new Error(
          "message" in result ? result.message : "Erro ao salvar links.",
        );
      }

      if (!result.data) {
        throw new Error("Erro ao salvar links.");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(siteLinkKeys.all, data);
    },
  });
}

export function getResolvedSiteLinks(
  data: SiteLinksGrouped | undefined,
): SiteLinksGrouped {
  return unwrapSiteLinks(data);
}
