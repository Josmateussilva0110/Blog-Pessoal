import type { CreateProjectInput, Project } from "@blog/shared";
import { projectsService } from "@/service";
import type { ApiResponse } from "@/service/types";

function unwrap<T>(result: ApiResponse<T>): T {
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function fetchProjects(): Promise<Project[]> {
  const result = await projectsService.list();
  return unwrap(result);
}

export async function fetchAdminProjects(): Promise<Project[]> {
  const result = await projectsService.listAdmin();
  return unwrap(result);
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const result = await projectsService.featured();
  return unwrap(result);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const result = await projectsService.getBySlug(slug);
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

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const result = await projectsService.create(data);
  return unwrap(result);
}

export async function updateProject(
  id: string,
  data: Partial<CreateProjectInput>,
): Promise<Project> {
  const result = await projectsService.update(id, data);
  return unwrap(result);
}

export async function deleteProject(id: string): Promise<void> {
  const result = await projectsService.remove(id);
  if (!result.success) {
    throw new Error(result.message);
  }
}
