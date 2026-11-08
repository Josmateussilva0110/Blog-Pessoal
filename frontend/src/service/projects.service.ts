import type { HomeProjects, Project } from "@blog/shared";
import { request } from "./client";

const BASE = "/projects";

export const projectsService = {
  listAdmin() {
    return request<Project[]>(`${BASE}/admin`);
  },

  home() {
    return request<HomeProjects>(`${BASE}/home`);
  },

  /** fresh: revalida no servidor em vez de usar o cache HTTP do navegador */
  getBySlug(slug: string, fresh = false) {
    return request<Project>(`${BASE}/${slug}`, { cache: fresh ? "no-cache" : undefined });
  },

  getById(id: string) {
    return request<Project>(`${BASE}/id/${id}`);
  },

  remove(id: string) {
    return request<void>(`${BASE}/${id}`, { method: "DELETE" });
  },
};
