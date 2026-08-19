import type { CreateProjectInput, Project } from "@blog/shared";
import { env } from "@/config/env";
import { projectsService } from "@/service";
import { getMockProjectBySlug, MOCK_PROJECTS } from "./mock-data";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

import type { ApiResponse } from "@/service/types";

function unwrap<T>(result: ApiResponse<T>): T {
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function fetchProjects(): Promise<Project[]> {
  if (env.useMock) {
    return delay([...MOCK_PROJECTS]);
  }

  const result = await projectsService.list();
  return unwrap(result);
}

export async function fetchAdminProjects(): Promise<Project[]> {
  if (env.useMock) {
    return delay([...MOCK_PROJECTS]);
  }

  const result = await projectsService.listAdmin();
  return unwrap(result);
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  if (env.useMock) {
    return delay(MOCK_PROJECTS.filter((p) => p.featured));
  }

  const result = await projectsService.featured();
  return unwrap(result);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  if (env.useMock) {
    return delay(getMockProjectBySlug(slug) ?? null);
  }

  const result = await projectsService.getBySlug(slug);
  if (!result.success) {
    if (result.code === "NOT_FOUND") return null;
    throw new Error(result.message);
  }
  return result.data;
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
