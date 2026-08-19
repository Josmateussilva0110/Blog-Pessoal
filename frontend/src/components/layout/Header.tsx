import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS, SITE } from "@/config/constants";
import { TypingText } from "@/components/ui/TypingText";
import { cn } from "@/lib/format";

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 px-4 pt-5 pb-2">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-text hover:text-accent transition-colors"
        >
          <TypingText text={SITE.name} />
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive =
              !("external" in link) &&
              (link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#") && pathname === "/");

            const className = cn(
              "font-mono text-sm transition-colors",
              isActive
                ? "text-accent"
                : "text-text-muted hover:text-text",
            );

            if ("external" in link && link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {"// "}
                  {link.label}
                </a>
              );
            }

            return (
              <a key={link.href} href={link.href} className={className}>
                {"// "}
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
