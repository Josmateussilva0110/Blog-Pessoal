import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/format";
import { BackgroundOrbs } from "./BackgroundOrbs";

const adminNav = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/projetos", label: "Projetos", end: false },
];

export function AdminLayout() {
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
      </aside>
      <main className="flex-1 p-4 pr-6">
        <div className="glass-strong rounded-2xl p-8 min-h-[calc(100dvh-2rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
