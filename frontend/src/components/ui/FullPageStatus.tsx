/** Aviso de tela cheia enquanto algo carrega (sessão, página lazy do admin) */
export function FullPageStatus({ message = "Carregando…" }: { message?: string }) {
  return (
    <div className="admin-shell flex min-h-dvh items-center justify-center bg-home-bg">
      <span role="status" className="animate-pulse text-sm text-home-muted">
        {message}
      </span>
    </div>
  );
}
