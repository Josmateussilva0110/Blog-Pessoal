import type { CreateProjectInput, Project } from "@blog/shared";
import { request } from "./client";

const BASE = "/projects";

export const projectsService = {
  list() {
    return request<Project[]>(BASE);
  },

  listAdmin() {
    return request<Project[]>(`${BASE}/admin`);
  },

  featured() {
    return request<Project[]>(`${BASE}/featured`);
  },

  getBySlug(slug: string) {
    return request<Project>(`${BASE}/${slug}`);
  },

  getById(id: string) {
    return request<Project>(`${BASE}/id/${id}`);
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
