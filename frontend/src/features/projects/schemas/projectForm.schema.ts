import { projectFormSchema as sharedProjectFormSchema } from "@blog/shared";
import type { z } from "zod";

/**
 * Mesmo schema validado pelo backend; a ordem das imagens (imageOrder) é
 * montada no envio a partir do estado local, então não faz parte do form.
 */
export const projectFormSchema = sharedProjectFormSchema.omit({ imageOrder: true });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
