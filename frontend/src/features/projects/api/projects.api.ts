import type { HomeProjects, Project } from "@blog/shared";
import { projectsService, unwrap } from "@/service";

export async function fetchAdminProjects(): Promise<Project[]> {
  const result = await projectsService.listAdmin();
  return unwrap(result);
}

export async function fetchHomeProjects(): Promise<HomeProjects> {
  const result = await projectsService.home();
  return unwrap(result);
}

export async function fetchProjectBySlug(slug: string, fresh = false): Promise<Project | null> {
  const result = await projectsService.getBySlug(slug, fresh);
  if (!result.success) {
    if (result.code === "NOT_FOUND") return null;
    throw new Error(result.message);
  }
  return result.data;
}

export async function fetchProjectById(id: string): Promise<Project> {
  const result = await projectsService.getById(id);
  return unwrap(result);
}

export async function deleteProject(id: string): Promise<void> {
  const result = await projectsService.remove(id);
  if (!result.success) {
    throw new Error(result.message);
  }
}
