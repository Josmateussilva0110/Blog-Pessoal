import { ProfileImageForm } from "@/features/profile/components/ProfileImageForm";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-6 sm:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/70 mb-2">
          Conta
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">Configurações</h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Gerencie a foto do portfólio e a segurança da sua conta.
        </p>
      </header>

      <section className="glass rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
        <h2 className="text-sm font-semibold text-text mb-4">Foto de perfil</h2>
        <ProfileImageForm />
      </section>

      <section className="glass rounded-2xl p-4 sm:p-6 md:p-8">
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
