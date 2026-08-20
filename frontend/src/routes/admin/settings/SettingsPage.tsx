import { ProfileImageForm } from "@/features/profile/components/ProfileImageForm";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { HeroStatsForm } from "@/features/site-settings/components/HeroStatsForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-3xl">
      <AdminPageHeader
        eyebrow="Conta"
        title="Configurações"
        description="Gerencie a foto do portfólio, estatísticas da home e a segurança da sua conta."
      />

      <section className="admin-card p-5 sm:p-6 mb-4 sm:mb-6">
        <p className="code-comment mb-3">// hero stats</p>
        <h2 className="text-sm font-semibold text-text mb-4">Estatísticas da home</h2>
        <HeroStatsForm />
      </section>

      <section className="admin-card p-5 sm:p-6 mb-4 sm:mb-6">
        <p className="code-comment mb-3">// profile image</p>
        <h2 className="text-sm font-semibold text-text mb-4">Foto de perfil</h2>
        <ProfileImageForm />
      </section>

      <section className="admin-card p-5 sm:p-6">
        <p className="code-comment mb-3">// security</p>
        <h2 className="text-sm font-semibold text-text mb-1">Alterar senha</h2>
        {user?.email && (
          <p className="font-mono text-xs text-text-subtle mb-6">
            user: <span className="text-accent">{user.email}</span>
          </p>
        )}
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
