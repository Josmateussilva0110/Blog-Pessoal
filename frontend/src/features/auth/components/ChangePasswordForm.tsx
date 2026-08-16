import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  forcedChangePasswordSchema,
  type ForcedChangePasswordFormValues,
} from "@/features/auth/schemas/changePassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
    try {
      await changePassword(values);
      toast.success("Senha atualizada com sucesso.");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <PasswordInput
        label="Nova senha"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.new_password?.message}
        {...register("new_password")}
      />

      <PasswordInput
        label="Confirmar nova senha"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      <p className="text-[11px] text-text-muted leading-relaxed">
        Mínimo 8 caracteres, com maiúscula, número e caractere especial.
      </p>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Definir nova senha"}
      </Button>
    </form>
  );
}
