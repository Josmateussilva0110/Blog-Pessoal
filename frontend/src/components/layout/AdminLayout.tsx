import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-dvh flex relative">
      <BackgroundOrbs />
      <aside className="w-56 shrink-0 m-4 glass-strong rounded-2xl p-4 flex flex-col gap-1 self-start sticky top-4">
        <p className="text-xs font-medium text-accent px-3 py-2 mb-2">Admin</p>
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "text-sm px-3 py-2 rounded-xl transition-all",
                isActive
                  ? "bg-blue-500/15 text-accent border border-blue-400/30"
                  : "text-text-muted hover:text-text hover:bg-white/5",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          {user?.email && (
            <p className="text-[11px] text-text-muted px-3 py-2 truncate">
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
      <main className="flex-1 p-4 pr-6">
        <div className="glass-strong rounded-2xl p-8 min-h-[calc(100dvh-2rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
