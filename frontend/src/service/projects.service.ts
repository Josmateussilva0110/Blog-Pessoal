import type { HomeProjects, PaginatedList, Project } from "@blog/shared";
// Constante pelo subpath: a raiz do shared traria os schemas zod para o bundle da home
import { PAGINATION_MAX_LIMIT } from "@blog/shared/constants";
import { API_ENDPOINTS } from "@/config/apiEndpoints";
import { request } from "./client";

const BASE = "/projects";

export const projectsService = {
  /** O admin mostra todos os projetos numa tela só: pede a maior página que a API aceita */
  listAdmin() {
    return request<PaginatedList<Project>>(`${BASE}/admin`, { params: { limit: PAGINATION_MAX_LIMIT } });
  },

  home() {
    return request<HomeProjects>(API_ENDPOINTS.projectsHome);
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
