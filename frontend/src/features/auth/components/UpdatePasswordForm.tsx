import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/features/auth/schemas/changePassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function UpdatePasswordForm() {
  const { changePassword } = useAuth();
  const toast = useToast();

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
    try {
      await changePassword(values);
      reset();
      toast.success("Senha atualizada com sucesso.");
    } catch (error) {
      toast.error(
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
      <PasswordInput
        label="Senha atual"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.current_password?.message}
        {...register("current_password")}
      />

      <PasswordInput
        label="Nova senha"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.new_password?.message}
        {...register("new_password")}
      />

      <PasswordInput
        label="Repetir nova senha"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      <p className="text-[11px] text-text-muted leading-relaxed">
        Mínimo 8 caracteres, com maiúscula, número e caractere especial.
      </p>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
