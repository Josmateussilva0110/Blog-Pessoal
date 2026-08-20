import type { HeroStats } from "@blog/shared";
import { request } from "./client";

const BASE = "/site-settings";

export const siteSettingsService = {
  getHeroStats() {
    return request<HeroStats>(`${BASE}/hero-stats`);
  },

  updateHeroStats(data: HeroStats) {
    return request<HeroStats>(`${BASE}/hero-stats`, { method: "PUT", body: data });
  },
};
