import { useEffect, useState, type CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/format";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";
const SIDEBAR_WIDTH_EXPANDED = "15.5rem";
const SIDEBAR_WIDTH_COLLAPSED = "4.75rem";

const adminNav = [
  { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projetos", end: false, icon: FolderKanban },
  { to: "/admin/settings", label: "Conta", end: false, icon: Settings },
];

function getUserInitials(email?: string | null) {
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase();
}

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

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

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [sidebarCollapsed]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => !current);
  }

  return (
    <div className="admin-shell min-h-dvh lg:flex">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        style={
          {
            "--admin-sidebar-width": sidebarCollapsed
              ? SIDEBAR_WIDTH_COLLAPSED
              : SIDEBAR_WIDTH_EXPANDED,
          } as CSSProperties
        }
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col overflow-hidden border-r border-white/[0.06] bg-[#09090b]",
          "transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-white/[0.06] py-5",
            sidebarCollapsed ? "justify-center px-2" : "justify-between gap-3 px-5",
          )}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Admin
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">Painel</p>
            </div>
          )}

          <div className={cn("flex items-center gap-1", sidebarCollapsed && "flex-col")}>
            <button
              type="button"
              className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100 lg:inline-flex"
              aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              aria-expanded={!sidebarCollapsed}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="size-5" aria-hidden />
              ) : (
                <ChevronLeft className="size-5" aria-hidden />
              )}
            </button>

            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100 lg:hidden"
              aria-label="Fechar menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <nav className={cn("flex-1 space-y-1 py-4", sidebarCollapsed ? "px-2" : "px-3")}>
          {adminNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center rounded-xl text-sm font-medium transition-colors",
                    sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-white/[0.07] text-zinc-50"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        isActive
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-white/[0.06] bg-white/[0.02] text-zinc-500 group-hover:text-zinc-300",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {!sidebarCollapsed && item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn("space-y-2 border-t border-white/[0.06]", sidebarCollapsed ? "p-2" : "p-3")}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={sidebarCollapsed ? "Ver site" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100",
              sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <ExternalLink className="size-4" aria-hidden />
            </span>
            {!sidebarCollapsed && "Ver site"}
          </a>

          <div
            className={cn(
              "rounded-xl border border-white/[0.06] bg-white/[0.02]",
              sidebarCollapsed ? "p-2" : "p-3",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                sidebarCollapsed ? "justify-center" : "gap-3",
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300"
                title={sidebarCollapsed ? user?.username ?? "Administrador" : undefined}
              >
                {getUserInitials(user?.email)}
              </span>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {user?.username ?? "Administrador"}
                  </p>
                  {user?.email && (
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              title={sidebarCollapsed ? "Sair" : undefined}
              className={cn(
                "mt-3 rounded-lg text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
                sidebarCollapsed ? "w-full justify-center px-2" : "w-full justify-start px-2",
              )}
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              {!sidebarCollapsed && "Sair"}
            </Button>
          </div>
        </div>
      </aside>

      <div className="admin-main flex min-h-dvh min-w-0 flex-1 flex-col bg-[#0f0f12]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0f0f12]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/[0.06] p-2 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <p className="truncate text-sm text-zinc-500">
              Gerenciamento do portfólio
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
