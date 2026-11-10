import { ArrowUpRight } from "lucide-react";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { usePublicSiteLinks } from "@/features/site-links/hooks/useSiteLinks";

/** Faixa de contato no fim da home, com os links sociais cadastrados no admin */
export function ContactLinks() {
  const { data: siteLinks } = usePublicSiteLinks();
  const socialLinks = siteLinks?.social ?? DEFAULT_SITE_LINKS.social;

  if (socialLinks.length === 0) return null;

  return (
    <section aria-label="Contato" className="home-card flex flex-wrap gap-1 p-3">
      {socialLinks.map((link) => (
        <a
          key={`${link.label}-${link.href}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-13 flex-[1_1_12.5rem] items-center justify-between rounded-xl bg-home-inset px-4 font-medium capitalize text-home-ink transition-colors hover:bg-home-raised focus-visible:outline-2 focus-visible:outline-brand"
        >
          {link.label}
          <ArrowUpRight className="size-4 text-home-muted" aria-hidden />
        </a>
      ))}
    </section>
  );
}
