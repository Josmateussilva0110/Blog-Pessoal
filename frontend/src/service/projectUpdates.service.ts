import type { CreatedId, PaginatedList, ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared";
import { PAGINATION_MAX_LIMIT } from "@blog/shared/constants";
import { request } from "./client";

const BASE = "/projects";

export const projectUpdatesService = {
  list(projectId: string) {
    return request<PaginatedList<ProjectUpdate>>(`${BASE}/id/${projectId}/updates`, {
      params: { limit: PAGINATION_MAX_LIMIT },
    });
  },

  create(projectId: string, data: ProjectUpdateFormValues) {
    return request<CreatedId>(`${BASE}/${projectId}/updates`, { method: "POST", body: data });
  },

  update(projectId: string, updateId: string, data: ProjectUpdateFormValues) {
    return request<CreatedId>(`${BASE}/${projectId}/updates/${updateId}`, {
      method: "PUT",
      body: data,
    });
  },

  remove(projectId: string, updateId: string) {
    return request<void>(`${BASE}/${projectId}/updates/${updateId}`, { method: "DELETE" });
  },
};
