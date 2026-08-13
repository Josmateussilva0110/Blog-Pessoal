import { Link } from "react-router-dom";
import { NAV_LINKS, SITE } from "@/config/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-text hover:text-accent transition-colors"
        >
          {SITE.name}
          <span className="text-accent">_</span>dev
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
