import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HeroStats } from "@blog/shared";
import { siteSettingsService, unwrap } from "@/service";

export const heroStatsKeys = {
  all: ["hero-stats"] as const,
};

export function useHeroStats() {
  return useQuery({
    queryKey: heroStatsKeys.all,
    queryFn: async (): Promise<HeroStats> => unwrap(await siteSettingsService.getHeroStats()),
  });
}

export function useUpdateHeroStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: HeroStats) =>
      unwrap(await siteSettingsService.updateHeroStats(payload)),
    onSuccess: (data) => {
      queryClient.setQueryData(heroStatsKeys.all, data);
    },
  });
}
