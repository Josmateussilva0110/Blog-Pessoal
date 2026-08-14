import { BackgroundOrbs } from "@/components/layout/BackgroundOrbs";

export function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 relative">
      <BackgroundOrbs />
      <div className="w-full max-w-sm text-center glass-strong rounded-3xl p-10">
        <p className="text-xs font-medium text-accent mb-2">Admin</p>
        <h1 className="text-2xl font-bold text-text mb-2">Login</h1>
        <p className="text-sm text-text-muted">
          Tela de autenticação — será integrada com Supabase Auth.
        </p>
      </div>
    </div>
  );
}
