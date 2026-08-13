import type { CreateProjectInput, Project } from "@blog/shared";
import { request } from "./client";

const BASE = "/projects";

export const projectsService = {
  list() {
    return request<Project[]>(BASE);
  },

  featured() {
    return request<Project[]>(`${BASE}/featured`);
  },

  getBySlug(slug: string) {
    return request<Project>(`${BASE}/${slug}`);
  },

  create(data: CreateProjectInput) {
    return request<Project>(BASE, { method: "POST", body: data });
  },

  update(id: string, data: Partial<CreateProjectInput>) {
    return request<Project>(`${BASE}/${id}`, { method: "PUT", body: data });
  },

  remove(id: string) {
    return request<void>(`${BASE}/${id}`, { method: "DELETE" });
  },
};
