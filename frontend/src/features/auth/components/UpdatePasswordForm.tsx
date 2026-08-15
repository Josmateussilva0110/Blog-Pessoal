import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/features/auth/schemas/changePassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function UpdatePasswordForm() {
  const { changePassword } = useAuth();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: UpdatePasswordFormValues) {
    setApiError("");
    setSuccessMessage("");

    try {
      await changePassword(values);
      reset();
      setSuccessMessage("Senha atualizada com sucesso.");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md"
      noValidate
    >
      <Input
        label="Senha atual"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.current_password?.message}
        {...register("current_password")}
      />

      <Input
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.new_password?.message}
        {...register("new_password")}
      />

      <Input
        label="Repetir nova senha"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      <p className="text-[11px] text-text-muted leading-relaxed">
        Mínimo 8 caracteres, com maiúscula, número e caractere especial.
      </p>

      {apiError && (
        <p className="text-xs text-red-300 leading-relaxed" role="alert">
          {apiError}
        </p>
      )}

      {successMessage && (
        <p className="text-xs text-emerald-300/90 leading-relaxed" role="status">
          {successMessage}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
