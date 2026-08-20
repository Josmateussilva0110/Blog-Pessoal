import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SITE } from "@/config/constants";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { TypingText } from "@/components/ui/TypingText";
import { cn } from "@/lib/format";
import { prefersReducedMotion, scrollToPageTop } from "@/lib/viewTransition";

type NavLinkItem = {
  label: string;
  href?: string;
  external?: boolean;
};

function handleHomeNavClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
  onNavigate?: () => void,
) {
  if (href !== "/" || pathname !== "/") {
    onNavigate?.();
    return;
  }

  event.preventDefault();
  onNavigate?.();

  if (window.location.hash) {
    window.history.replaceState(null, "", "/");
  }

  scrollToPageTop(prefersReducedMotion() ? "instant" : "smooth");
}

function getLinkClassName(isActive: boolean, mobile = false) {
  return cn(
    "font-mono transition-colors",
    mobile ? "text-sm py-2.5 px-3 rounded-md" : "text-sm",
    isActive
      ? "text-accent"
      : mobile
        ? "text-text-muted hover:text-text hover:bg-surface-raised"
        : "text-text-muted hover:text-text",
  );
}

function NavLinks({
  links,
  pathname,
  mobile = false,
  onNavigate,
}: {
  links: NavLinkItem[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => {
        const href = link.href ?? "/";
        const isActive =
          !link.external &&
          (href === "/"
            ? pathname === "/"
            : href.startsWith("/#") && pathname === "/");

        const className = getLinkClassName(isActive, mobile);

        if (link.external) {
          return (
            <a
              key={`${link.label}-${href}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              onClick={onNavigate}
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
            onClick={(event) => handleHomeNavClick(event, href, pathname, onNavigate)}
          >
            {"// "}
            {link.label}
          </a>
        );
      })}
    </>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const { data: siteLinks } = useSiteLinks();
  const navLinks = siteLinks?.nav ?? DEFAULT_SITE_LINKS.nav;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4 sm:pt-5 pb-2 bg-surface/80 backdrop-blur-md border-b border-border-subtle/60">
      <div className="relative z-[60] mx-auto max-w-6xl flex items-center justify-between gap-4">
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-text hover:text-accent transition-colors min-w-0 truncate"
        >
          <TypingText text={SITE.name} />
        </Link>

        <nav className="hidden sm:flex items-center gap-6 shrink-0">
          <NavLinks links={navLinks} pathname={pathname} />
        </nav>

        <button
          type="button"
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-border-subtle text-text-muted hover:text-text hover:border-border transition-colors shrink-0"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav"
          aria-label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <Menu className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-surface/60 backdrop-blur-[2px] sm:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="relative z-[60] sm:hidden mt-3 pt-3 border-t border-border-subtle flex flex-col gap-1"
          >
            <NavLinks
              links={navLinks}
              pathname={pathname}
              mobile
              onNavigate={() => setMobileNavOpen(false)}
            />
          </nav>
        </>
      )}
    </header>
  );
}
