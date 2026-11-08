import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SITE } from "@/config/constants";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { TypingText } from "@/components/ui/TypingText";
import { usePageWidthClass } from "@/hooks/usePageWidth";
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
    // Rótulos vêm do admin em minúsculas ("projects", "github")
    "inline-flex items-center gap-1 rounded-[0.625rem] text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-brand",
    mobile ? "min-h-11 px-3" : "min-h-10 px-3.5",
    isActive
      ? "bg-home-inset text-home-ink"
      : "text-home-muted hover:bg-home-inset/60 hover:text-home-ink",
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
        // Só a página atual fica destacada; as âncoras da home (/#projetos) não,
        // senão todos os links aparecem ativos ao mesmo tempo na home
        const isActive = !link.external && href === "/" && pathname === "/";

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
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden />
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
            {link.label}
          </a>
        );
      })}
    </>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const pageWidth = usePageWidthClass();
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
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      {/* Fora do card: com backdrop-filter no card, um fixed dentro dele ficaria preso ao card */}
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-home-bg/60 backdrop-blur-[2px] sm:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Barra em card, como os blocos da home */}
      <div
        className={cn(
          "relative z-[60] mx-auto rounded-2xl border border-home-line bg-home-card/85 py-2 pl-5 pr-2 backdrop-blur-md",
          pageWidth,
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="min-w-0 truncate font-semibold tracking-[-0.01em] text-home-ink transition-colors hover:text-white"
          >
            <TypingText text={SITE.name} />
          </Link>

          <nav className="hidden shrink-0 items-center gap-1 sm:flex" aria-label="Principal">
            <NavLinks links={navLinks} pathname={pathname} />
          </nav>

          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] text-home-muted transition-colors hover:bg-home-inset hover:text-home-ink sm:hidden"
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
          <nav
            id="mobile-nav"
            aria-label="Principal"
            className="mt-2 flex flex-col gap-1 border-t border-home-line pb-1 pt-2 pr-3 sm:hidden"
          >
            <NavLinks
              links={navLinks}
              pathname={pathname}
              mobile
              onNavigate={() => setMobileNavOpen(false)}
            />
          </nav>
        )}
      </div>
    </header>
  );
}
