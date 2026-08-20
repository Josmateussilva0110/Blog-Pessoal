import { z } from "zod";

export const heroStatsSchema = z.object({
  yearsCoding: z.number().int().min(0).max(50),
});

export const updateHeroStatsSchema = heroStatsSchema;

export type HeroStats = z.infer<typeof heroStatsSchema>;
