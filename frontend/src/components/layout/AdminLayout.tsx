import { useEffect, useState, type CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Link2,
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
  { to: "/admin", label: "dashboard", end: true, icon: LayoutDashboard },
  { to: "/admin/projects", label: "projects", end: false, icon: FolderKanban },
  { to: "/admin/links", label: "links", end: false, icon: Link2 },
  { to: "/admin/settings", label: "settings", end: false, icon: Settings },
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
    <div className="admin-shell min-h-dvh lg:flex grid-bg">
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
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col overflow-hidden border-r",
          "transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
          <span className="h-2 w-2 rounded-full bg-red-500/80 shrink-0" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80 shrink-0" />
          <span className="h-2 w-2 rounded-full bg-terminal/80 shrink-0" />
          {!sidebarCollapsed && (
            <span className="font-mono text-[10px] ml-1 truncate">
              <span className="text-terminal">mateus@dev</span>
              <span className="text-text-subtle">:</span>
              <span className="text-accent">~/admin</span>
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex items-center border-b border-border-subtle py-4",
            sidebarCollapsed ? "justify-center px-2" : "justify-between gap-3 px-4",
          )}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="code-comment">// painel</p>
              <p className="mt-1 font-mono text-sm font-semibold text-text">admin shell</p>
            </div>
          )}

          <div className={cn("flex items-center gap-1", sidebarCollapsed && "flex-col")}>
            <button
              type="button"
              className="hidden rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-soft hover:text-text lg:inline-flex"
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
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-soft hover:text-text lg:hidden"
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
                    "group flex items-center rounded-lg font-mono text-sm transition-colors",
                    sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-text-muted hover:bg-accent-soft/50 hover:text-text",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isActive
                          ? "border-accent/25 bg-accent-soft text-accent"
                          : "border-border-subtle bg-surface-raised text-text-subtle group-hover:text-text-muted",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-text-subtle">{"// "}</span>
                        {item.label}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn("space-y-2 border-t border-border-subtle", sidebarCollapsed ? "p-2" : "p-3")}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={sidebarCollapsed ? "Ver site" : undefined}
            className={cn(
              "flex items-center rounded-lg font-mono text-sm text-text-muted transition-colors hover:bg-accent-soft/50 hover:text-text",
              sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-raised">
              <ExternalLink className="size-4" aria-hidden />
            </span>
            {!sidebarCollapsed && (
              <>
                <span className="text-text-subtle">{"// "}</span>
                site
              </>
            )}
          </a>

          <div
            className={cn(
              "rounded-lg border border-border-subtle bg-surface-raised",
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
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent-soft font-mono text-xs font-semibold text-accent"
                title={sidebarCollapsed ? user?.username ?? "Administrador" : undefined}
              >
                {getUserInitials(user?.email)}
              </span>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-text">
                    {user?.username ?? "admin"}
                  </p>
                  {user?.email && (
                    <p className="truncate font-mono text-[10px] text-text-subtle">
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              title={sidebarCollapsed ? "Sair" : undefined}
              className={cn(
                "mt-3 font-mono text-text-muted hover:bg-accent-soft hover:text-text",
                sidebarCollapsed ? "w-full justify-center px-2" : "w-full justify-start px-2",
              )}
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              {!sidebarCollapsed && "logout()"}
            </Button>
          </div>
        </div>
      </aside>

      <div className="admin-main flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border-subtle bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-border-subtle p-2 text-text-muted transition-colors hover:bg-accent-soft hover:text-text lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <p className="truncate font-mono text-xs text-text-subtle">
              <span className="text-terminal">$ </span>
              admin --shell
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
