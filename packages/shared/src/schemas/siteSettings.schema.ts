import { z } from "zod";

/** Limite de anos de experiência aceito no admin */
export const HERO_YEARS_CODING_MAX = 50;

export const heroStatsSchema = z.object({
  yearsCoding: z
    .number({ error: "Informe um número." })
    .int("Use um número inteiro.")
    .min(0, "O valor não pode ser negativo.")
    .max(HERO_YEARS_CODING_MAX, `Use no máximo ${HERO_YEARS_CODING_MAX}.`),
});

export const updateHeroStatsSchema = heroStatsSchema;

export type HeroStats = z.infer<typeof heroStatsSchema>;
