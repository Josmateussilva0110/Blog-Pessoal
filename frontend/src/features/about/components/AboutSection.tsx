import { SectionHeader } from "@/components/ui/SectionHeader";
import { TerminalPanel, TerminalWindow } from "@/components/ui/TerminalWindow";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { Rocket, Settings, Target, type LucideIcon } from "lucide-react";

const HIGHLIGHTS: Array<{
  icon: LucideIcon;
  label: string;
  text: string;
}> = [
  {
    icon: Target,
    label: "Foco",
    text: "Aplicações web e mobile com código limpo e boa experiência de uso.",
  },
  {
    icon: Settings,
    label: "Stack principal",
    text: "TypeScript, React, Node.js, PostgreSQL e Docker.",
  },
  {
    icon: Rocket,
    label: "Abordagem",
    text: "Do back-end à interface — construo soluções completas com atenção ao detalhe.",
  },
];

export function AboutSection() {
  const { data: siteLinks } = useSiteLinks();
  const socialLinks = siteLinks?.social ?? DEFAULT_SITE_LINKS.social;

  return (
    <section id="sobre" className="py-16 md:py-20 scroll-mt-28">
      <SectionHeader
        tag="Apresentação"
        title="Sobre mim"
        subtitle="Um pouco sobre quem está por trás dos projetos."
      />

      <TerminalWindow path="~/about.md">
        <p className="font-mono text-xs text-text-subtle mb-4">
          <span className="text-terminal">$ </span>
          <span className="text-accent">cat</span>
          <span className="text-text-muted"> about.md</span>
        </p>

        <p className="text-text-muted leading-relaxed max-w-2xl mb-8">
          Desenvolvedor apaixonado por criar soluções com foco em experiência e
          código limpo. Cada projeto aqui traz stack, links e contexto técnico.
          Gosto de explorar tecnologias novas e transformar ideias em produtos
          reais.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {HIGHLIGHTS.map(({ icon: Icon, label, text }) => (
            <TerminalPanel key={label} title={`// ${label.toLowerCase()}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold text-text">{label}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{text}</p>
            </TerminalPanel>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border-subtle">
          {socialLinks.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-text-muted border border-border-subtle px-4 py-2.5 hover:text-accent hover:border-accent/30 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </TerminalWindow>
    </section>
  );
}
