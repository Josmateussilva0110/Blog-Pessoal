import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  forcedChangePasswordSchema,
  type ForcedChangePasswordFormValues,
} from "@/features/auth/schemas/changePassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForcedChangePasswordFormValues>({
    resolver: zodResolver(forcedChangePasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: ForcedChangePasswordFormValues) {
    setApiError("");

    try {
      await changePassword(values);
      navigate("/admin", { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.new_password?.message}
        {...register("new_password")}
      />

      <Input
        label="Confirmar nova senha"
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Definir nova senha"}
      </Button>
    </form>
  );
}
