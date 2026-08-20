import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HeroStats } from "@blog/shared";
import { siteSettingsService } from "@/service/siteSettings.service";

export const heroStatsKeys = {
  all: ["hero-stats"] as const,
};

const DEFAULT_HERO_STATS: HeroStats = {
  yearsCoding: 4,
};

export function useHeroStats() {
  return useQuery({
    queryKey: heroStatsKeys.all,
    queryFn: async () => {
      const result = await siteSettingsService.getHeroStats();

      if (!result.success || !result.data) {
        return DEFAULT_HERO_STATS;
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateHeroStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: HeroStats) => {
      const result = await siteSettingsService.updateHeroStats(payload);

      if (!result.success) {
        throw new Error(
          "message" in result ? result.message : "Erro ao salvar estatísticas.",
        );
      }

      if (!result.data) {
        throw new Error("Erro ao salvar estatísticas.");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(heroStatsKeys.all, data);
    },
  });
}
