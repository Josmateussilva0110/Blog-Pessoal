import { AuthCard } from "@/features/auth/components/AuthCard";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export function ChangePasswordPage() {
  return (
    <AuthCard
      title="Nova senha"
      subtitle="Sua senha é temporária. Defina uma nova senha para continuar."
    >
      <ChangePasswordForm />
    </AuthCard>
  );
}
