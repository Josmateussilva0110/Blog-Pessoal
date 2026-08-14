import { Link } from "react-router-dom";
import { NAV_LINKS, SITE } from "@/config/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-4xl glass-strong rounded-2xl px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-sm font-semibold text-text hover:text-accent transition-colors"
        >
          {SITE.name}
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
