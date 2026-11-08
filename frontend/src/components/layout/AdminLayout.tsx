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
import { Image } from "@/components/ui/Image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { resolveProfileImageUrl } from "@/lib/profileImageUrl";
import { cn } from "@/lib/format";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";
const SIDEBAR_WIDTH_EXPANDED = "15.5rem";
const SIDEBAR_WIDTH_COLLAPSED = "4.75rem";

const adminNav = [
  { to: "/admin", label: "Painel", end: true, icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projetos", end: false, icon: FolderKanban },
  { to: "/admin/links", label: "Links", end: false, icon: Link2 },
  { to: "/admin/settings", label: "Configurações", end: false, icon: Settings },
];

/** Linha do menu lateral: ícone + rótulo; recolhida mostra só o ícone */
function navItemClass(collapsed: boolean, active = false) {
  return cn(
    "group flex min-h-11 items-center rounded-xl text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand",
    collapsed ? "justify-center px-2" : "gap-3 px-3",
    active ? "bg-home-inset text-home-ink" : "text-home-muted hover:bg-home-inset/60 hover:text-home-ink",
  );
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
    <div className="admin-shell min-h-dvh bg-home-bg lg:flex">
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
          "fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col overflow-hidden border-r border-home-line bg-home-card",
          // Desktop: fixa na altura da tela, sem esticar junto com o conteúdo da página
          "transition-[width,transform] duration-200 ease-out lg:sticky lg:top-0 lg:h-dvh lg:shrink-0 lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex min-h-16 items-center border-b border-home-line",
            sidebarCollapsed ? "justify-center px-2" : "justify-between gap-3 pl-5 pr-3",
          )}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate font-semibold tracking-[-0.01em] text-home-ink">mateus.dev</p>
              <p className="text-xs text-home-muted">Painel admin</p>
            </div>
          )}

          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-xl text-home-muted transition-colors hover:bg-home-inset hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand lg:inline-flex"
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
            className="inline-flex size-10 items-center justify-center rounded-xl text-home-muted transition-colors hover:bg-home-inset hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav
          aria-label="Admin"
          className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto py-4", sidebarCollapsed ? "px-2" : "px-3")}
        >
          {adminNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={sidebarCollapsed ? item.label : undefined}
                aria-label={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) => navItemClass(sidebarCollapsed, isActive)}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn("size-[1.125rem] shrink-0 transition-colors", isActive && "text-brand")}
                      aria-hidden
                    />
                    {!sidebarCollapsed && item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn("space-y-2 border-t border-home-line", sidebarCollapsed ? "p-2" : "p-3")}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={sidebarCollapsed ? "Ver site" : undefined}
            aria-label={sidebarCollapsed ? "Ver site" : undefined}
            className={navItemClass(sidebarCollapsed)}
          >
            <ExternalLink className="size-[1.125rem] shrink-0" aria-hidden />
            {!sidebarCollapsed && "Ver site"}
          </a>

          <div className={cn("rounded-2xl bg-home-inset", sidebarCollapsed ? "p-2" : "p-3")}>
            <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
              <Image
                src={resolveProfileImageUrl(user?.profileImagePublicUrl)}
                alt={user?.username ?? "Administrador"}
                width={36}
                height={36}
                rounded="full"
                loading="eager"
                className="shrink-0"
                title={sidebarCollapsed ? user?.username ?? "Administrador" : undefined}
              />
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-home-ink">{user?.username ?? "admin"}</p>
                  {user?.email && <p className="truncate text-xs text-home-muted">{user.email}</p>}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              title={sidebarCollapsed ? "Sair" : undefined}
              aria-label={sidebarCollapsed ? "Sair" : undefined}
              className={cn(
                "mt-3 w-full hover:bg-home-raised",
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-2",
              )}
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              {!sidebarCollapsed && "Sair"}
            </Button>
          </div>
        </div>
      </aside>

      <div className="admin-main flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* No desktop o menu lateral já identifica a área; a barra fica só no celular */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-home-line bg-home-card/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-home-muted transition-colors hover:bg-home-inset hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand"
            aria-label="Abrir menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <p className="truncate text-sm font-semibold text-home-ink">
            mateus.dev <span className="font-normal text-home-muted">· Admin</span>
          </p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
