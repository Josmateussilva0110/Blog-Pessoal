import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;

/** Letras (incl. acentuadas), números, espaço, ponto, hífen e underscore — sem HTML/tags */
const USERNAME_PATTERN = /^[a-zA-ZÀ-ÿ0-9._ -]+$/;

/** Requisitos de complexidade para novas senhas (cadastro e troca) */
export const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(PASSWORD_MAX_LENGTH, `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`)
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "Senha deve conter ao menos um número.")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um caractere especial.");

/** Login: só exige senha preenchida — contas antigas podem ter senha curta */
export const loginPasswordField = z
  .string()
  .min(1, "Senha é obrigatória.")
  .max(PASSWORD_MAX_LENGTH, `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`);

export const confirmPasswordField = z.string().min(1, "Confirme a nova senha.");

export const usernameField = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `Nome deve ter no mínimo ${USERNAME_MIN_LENGTH} caracteres.`)
  .max(USERNAME_MAX_LENGTH, `Nome deve ter no máximo ${USERNAME_MAX_LENGTH} caracteres.`)
  .regex(USERNAME_PATTERN, "Nome contém caracteres inválidos.");

export const loginSchema = z.object({
  // Mesmo tratamento no form e na API: espaços nas pontas e maiúsculas não mudam a conta
  email: z.string().trim().toLowerCase().pipe(z.email("Email inválido.")),
  password: loginPasswordField,
});

const PASSWORDS_MISMATCH = {
  error: "As senhas não coincidem.",
  path: ["confirm_password"],
};

export const forcedChangePasswordSchema = z
  .object({
    new_password: passwordField,
    confirm_password: confirmPasswordField,
  })
  .refine((data) => data.new_password === data.confirm_password, PASSWORDS_MISMATCH);

export const updatePasswordSchema = z
  .object({
    current_password: loginPasswordField,
    new_password: passwordField,
    confirm_password: confirmPasswordField,
  })
  .refine((data) => data.new_password === data.confirm_password, PASSWORDS_MISMATCH)
  .refine((data) => data.current_password !== data.new_password, {
    error: "A nova senha deve ser diferente da atual.",
    path: ["new_password"],
  });

/** Perfil devolvido pela API (login, sessão, troca de senha, foto) */
export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  must_change_password: z.boolean(),
  has_profile_image: z.boolean(),
  profile_image_updated_at: z.string().nullable(),
  profile_image_public_url: z.string().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForcedChangePasswordInput = z.infer<typeof forcedChangePasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ChangePasswordInput = ForcedChangePasswordInput | UpdatePasswordInput;
export type UserProfile = z.infer<typeof userProfileSchema>;
