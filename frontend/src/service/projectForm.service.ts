import type { CreatedId, ProjectFormValues } from "@blog/shared";
import { parseJsonResponse } from "./client";
import { fetchMultipartWithAuth } from "./fetchMultipart";
import type { ApiResponse } from "./types";

type ProjectFormFiles = {
  images: File[];
};

export async function submitProjectForm(
  payload: ProjectFormValues,
  files: ProjectFormFiles,
  projectId?: string,
): Promise<ApiResponse<CreatedId>> {
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

  return parseJsonResponse<CreatedId>(response);
}
