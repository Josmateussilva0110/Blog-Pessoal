import { z } from "zod";
import { loginPasswordField } from "./fields";

export const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: loginPasswordField,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
