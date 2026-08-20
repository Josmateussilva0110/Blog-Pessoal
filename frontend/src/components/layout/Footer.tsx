import { SITE } from "@/config/constants";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";

export function Footer() {
  const year = new Date().getFullYear();
  const { data: siteLinks } = useSiteLinks();
  const socialLinks = siteLinks?.social ?? DEFAULT_SITE_LINKS.social;

  return (
    <footer className="px-6 pb-8 mt-20 border-t border-border-subtle">
      <div className="mx-auto max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-text-subtle">
          © {year} {SITE.name}
        </p>
        <div className="flex gap-6">
          {socialLinks.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
