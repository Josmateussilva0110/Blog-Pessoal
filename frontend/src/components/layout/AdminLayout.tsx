import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/format";

const adminNav = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/projetos", label: "Projetos", end: false },
];

export function AdminLayout() {
  return (
    <div className="min-h-dvh flex">
      <aside className="w-56 shrink-0 border-r border-border-subtle bg-surface-raised p-4 flex flex-col gap-1">
        <p className="font-mono text-xs text-accent uppercase tracking-widest px-3 py-2 mb-4">
          Admin
        </p>
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "font-mono text-sm px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-text hover:bg-surface-overlay",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
