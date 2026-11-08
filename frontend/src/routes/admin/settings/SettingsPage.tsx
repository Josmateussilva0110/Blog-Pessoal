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

      <section className="admin-card mb-3 p-5 sm:p-7">
        <h2 className="mb-5 text-lg font-semibold tracking-[-0.02em] text-home-ink">Estatísticas da home</h2>
        <HeroStatsForm />
      </section>

      <section className="admin-card mb-3 p-5 sm:p-7">
        <h2 className="mb-5 text-lg font-semibold tracking-[-0.02em] text-home-ink">Foto de perfil</h2>
        <ProfileImageForm />
      </section>

      <section className="admin-card p-5 sm:p-7">
        <h2 className="mb-1 text-lg font-semibold tracking-[-0.02em] text-home-ink">Alterar senha</h2>
        {user?.email && (
          <p className="mb-6 text-sm text-home-muted">
            Conta: <span className="text-home-ink">{user.email}</span>
          </p>
        )}
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
