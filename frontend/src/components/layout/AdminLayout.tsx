import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/format";
import { BackgroundOrbs } from "./BackgroundOrbs";

const adminNav = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/projects", label: "Projetos", end: false },
  { to: "/admin/settings", label: "Conta", end: false },
];

export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row relative">
      <BackgroundOrbs />

      <header className="lg:hidden sticky top-0 z-30 mx-3 mt-3 glass-strong rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-accent">Admin</p>
          {user?.email && (
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          aria-label="Abrir menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(100%,17.5rem)] glass-strong p-4 flex flex-col gap-1",
          "transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:w-56 lg:m-4 lg:rounded-2xl lg:translate-x-0 lg:self-start lg:sticky lg:top-4",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-accent px-3 py-2">Admin</p>
          <button
            type="button"
            className="lg:hidden rounded-xl p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "text-sm px-3 py-2.5 rounded-xl transition-all",
                  isActive
                    ? "bg-blue-500/15 text-accent border border-blue-400/30"
                    : "text-text-muted hover:text-text hover:bg-white/5",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          {user?.email && (
            <p className="hidden lg:block text-[11px] text-text-muted px-3 py-2 truncate">
              {user.email}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-3 sm:p-4 lg:pr-6 lg:py-4">
        <div className="glass-strong rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[calc(100dvh-5.5rem)] lg:min-h-[calc(100dvh-2rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
