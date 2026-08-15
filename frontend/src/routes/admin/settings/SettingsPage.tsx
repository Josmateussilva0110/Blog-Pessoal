import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/70 mb-2">
          Conta
        </p>
        <h1 className="text-2xl font-bold text-text mb-2">Configurações</h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Gerencie a segurança da sua conta administrativa.
        </p>
      </header>

      <section className="glass rounded-2xl p-6 md:p-8">
        <h2 className="text-sm font-semibold text-text mb-1">Alterar senha</h2>
        {user?.email && (
          <p className="text-xs text-text-muted mb-6">
            Conta: <span className="text-text">{user.email}</span>
          </p>
        )}
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
