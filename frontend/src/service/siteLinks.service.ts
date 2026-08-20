import type { SiteLinksGrouped, UpdateSiteLinksInput } from "@blog/shared";
import { request } from "./client";

const BASE = "/site-links";

export const siteLinksService = {
  list() {
    return request<SiteLinksGrouped>(BASE);
  },

  update(data: UpdateSiteLinksInput) {
    return request<SiteLinksGrouped>(BASE, { method: "PUT", body: data });
  },
};
