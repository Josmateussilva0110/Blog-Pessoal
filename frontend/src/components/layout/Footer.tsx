import { useLocation } from "react-router-dom";
import { SITE } from "@/config/constants";
import { usePageWidthClass } from "@/hooks/usePageWidth";
import { cn } from "@/lib/format";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";

export function Footer() {
  const { pathname } = useLocation();
  const pageWidth = usePageWidthClass();
  const year = new Date().getFullYear();
  const { data: siteLinks } = useSiteLinks();
  const socialLinks = siteLinks?.social ?? DEFAULT_SITE_LINKS.social;
  // Na home os links sociais já aparecem na faixa de contato logo acima
  const showSocial = pathname !== "/";

  return (
    <footer className="mt-12 px-4 pb-6 sm:mt-16 sm:px-6">
      <div
        className={cn(
          "mx-auto flex flex-col items-center gap-3 px-2 pt-3 text-center text-[13px] text-home-muted",
          pageWidth,
        )}
      >
        <p>
          © {year} {SITE.author}
        </p>
        {showSocial && (
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {socialLinks.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="capitalize transition-colors hover:text-home-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
