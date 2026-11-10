import { z } from "zod"

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail.")
  .max(255, "E-mail muito longo.")
  .pipe(z.email("Digite um e-mail válido."))
