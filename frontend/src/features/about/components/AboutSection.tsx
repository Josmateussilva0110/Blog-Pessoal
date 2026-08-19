import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/config/constants";
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
  return (
    <section id="sobre" className="py-16 md:py-20 scroll-mt-28">
      <SectionHeader
        tag="Apresentação"
        title="Sobre mim"
        subtitle="Um pouco sobre quem está por trás dos projetos."
      />

      <div className="glass-strong rounded-3xl p-8 md:p-10">
        <p className="text-text-muted leading-relaxed max-w-2xl mb-8">
          Desenvolvedor apaixonado por criar soluções com foco em experiência e
          código limpo. Cada projeto aqui traz stack, links e contexto técnico.
          Gosto de explorar tecnologias novas e transformar ideias em produtos
          reais.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {HIGHLIGHTS.map(({ icon: Icon, label, text }) => (
            <div
              key={label}
              className="glass rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 hover:bg-accent-soft hover:border-accent/20"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold text-text">{label}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
