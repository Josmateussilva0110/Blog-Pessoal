import { Link, useLocation } from "react-router-dom";
import { SITE } from "@/config/constants";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { TypingText } from "@/components/ui/TypingText";
import { cn } from "@/lib/format";
import { prefersReducedMotion, scrollToPageTop } from "@/lib/viewTransition";

function handleHomeNavClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
) {
  if (href !== "/" || pathname !== "/") return;

  event.preventDefault();

  if (window.location.hash) {
    window.history.replaceState(null, "", "/");
  }

  scrollToPageTop(prefersReducedMotion() ? "instant" : "smooth");
}

export function Header() {
  const { pathname } = useLocation();
  const { data: siteLinks } = useSiteLinks();
  const navLinks = siteLinks?.nav ?? DEFAULT_SITE_LINKS.nav;

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
          {navLinks.map((link) => {
            const href = link.href ?? "/";
            const isActive =
              !link.external &&
              (href === "/"
                ? pathname === "/"
                : href.startsWith("/#") && pathname === "/");

            const className = cn(
              "font-mono text-sm transition-colors",
              isActive
                ? "text-accent"
                : "text-text-muted hover:text-text",
            );

            if (link.external) {
              return (
                <a
                  key={`${link.label}-${href}`}
                  href={href}
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
              <a
                key={`${link.label}-${href}`}
                href={href}
                className={className}
                onClick={(event) => handleHomeNavClick(event, href, pathname)}
              >
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
