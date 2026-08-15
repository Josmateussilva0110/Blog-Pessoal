import { z } from "zod";
import { loginPasswordField, passwordField } from "./fields";

export const forcedChangePasswordSchema = z
  .object({
    new_password: passwordField,
    confirm_password: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  });

export const updatePasswordSchema = z
  .object({
    current_password: loginPasswordField,
    new_password: passwordField,
    confirm_password: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["new_password"],
  });

export type ForcedChangePasswordFormValues = z.infer<
  typeof forcedChangePasswordSchema
>;

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
