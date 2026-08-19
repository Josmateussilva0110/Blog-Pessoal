import { ProfileImageForm } from "@/features/profile/components/ProfileImageForm";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-3xl">
      <AdminPageHeader
        eyebrow="Conta"
        title="Configurações"
        description="Gerencie a foto do portfólio e a segurança da sua conta."
      />

      <section className="admin-card p-5 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">Foto de perfil</h2>
        <ProfileImageForm />
      </section>

      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-100 mb-1">Alterar senha</h2>
        {user?.email && (
          <p className="text-xs text-zinc-500 mb-6">
            Conta: <span className="text-zinc-300">{user.email}</span>
          </p>
        )}
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
