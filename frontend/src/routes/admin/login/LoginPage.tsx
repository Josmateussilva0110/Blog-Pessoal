export function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">
          Admin
        </p>
        <h1 className="text-2xl font-bold text-text mb-2">Login</h1>
        <p className="text-sm text-text-muted">
          Tela de autenticação — será integrada com Supabase Auth.
        </p>
      </div>
    </div>
  );
}
