import type { ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared";
import { request } from "./client";

const BASE = "/projects";

export const projectUpdatesService = {
  list(projectId: string) {
    return request<ProjectUpdate[]>(`${BASE}/id/${projectId}/updates`);
  },

  create(projectId: string, data: ProjectUpdateFormValues) {
    return request<ProjectUpdate>(`${BASE}/${projectId}/updates`, { method: "POST", body: data });
  },

  update(projectId: string, updateId: string, data: ProjectUpdateFormValues) {
    return request<ProjectUpdate>(`${BASE}/${projectId}/updates/${updateId}`, {
      method: "PUT",
      body: data,
    });
  },

  remove(projectId: string, updateId: string) {
    return request<void>(`${BASE}/${projectId}/updates/${updateId}`, { method: "DELETE" });
  },
};
