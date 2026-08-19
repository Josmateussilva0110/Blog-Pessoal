import type { ProjectFormValues } from "@blog/shared";
import type { ApiResponse } from "./types";
import type { Project } from "@blog/shared";
import { fetchMultipartWithAuth } from "./fetchMultipart";

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | { message?: string; code?: string }
    | null;

  if (!response.ok) {
    const errorBody = payload && "message" in payload ? payload : undefined;
    return {
      success: false,
      message: errorBody?.message ?? `Erro ${response.status}`,
      code: errorBody?.code,
    };
  }

  if (payload && "success" in payload) {
    return payload as ApiResponse<T>;
  }

  return { success: true, data: payload as T };
}

type ProjectFormFiles = {
  images: File[];
};

export async function submitProjectForm(
  payload: ProjectFormValues,
  files: ProjectFormFiles,
  projectId?: string,
): Promise<ApiResponse<Project>> {
  const endpoint = projectId ? `/projects/${projectId}` : "/projects";
  const method = projectId ? "PUT" : "POST";

  const response = await fetchMultipartWithAuth({
    method,
    endpoint,
    buildFormData: () => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      for (const image of files.images) {
        formData.append("images", image);
      }

      return formData;
    },
  });

  return parseJsonResponse<Project>(response);
}
