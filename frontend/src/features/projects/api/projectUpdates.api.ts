import type { ProjectUpdate, ProjectUpdateFormValues } from "@blog/shared";
import { projectUpdatesService } from "@/service";
import type { ApiResponse } from "@/service/types";

function unwrap<T>(result: ApiResponse<T>): T {
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function fetchProjectUpdates(projectId: string): Promise<ProjectUpdate[]> {
  return unwrap(await projectUpdatesService.list(projectId));
}

export async function createProjectUpdate(
  projectId: string,
  data: ProjectUpdateFormValues,
): Promise<ProjectUpdate> {
  return unwrap(await projectUpdatesService.create(projectId, data));
}

export async function updateProjectUpdate(
  projectId: string,
  updateId: string,
  data: ProjectUpdateFormValues,
): Promise<ProjectUpdate> {
  return unwrap(await projectUpdatesService.update(projectId, updateId, data));
}

export async function deleteProjectUpdate(projectId: string, updateId: string): Promise<void> {
  const result = await projectUpdatesService.remove(projectId, updateId);
  if (!result.success) {
    throw new Error(result.message);
  }
}
