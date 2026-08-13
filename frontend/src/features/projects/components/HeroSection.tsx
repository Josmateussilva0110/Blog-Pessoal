import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/config/constants";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl">
        <p className="font-mono text-sm text-accent mb-4 tracking-wider">
          {"// olá, mundo"}
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight mb-6">
          {SITE.name}
          <span className="text-accent">.</span>
          <span className="block text-2xl md:text-3xl font-normal text-text-muted mt-2">
            {SITE.title}
          </span>
        </h1>

        <p className="text-lg text-text-muted leading-relaxed max-w-xl mb-8">
          {SITE.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link to="/#projetos">
            <Button size="lg">Ver projetos</Button>
          </Link>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              GitHub →
            </Button>
          </a>
        </div>

        <div className="mt-12 flex items-center gap-6 font-mono text-xs text-text-subtle">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            disponível para projetos
          </span>
          <span>·</span>
          <span>full-stack</span>
          <span>·</span>
          <span>typescript</span>
        </div>
      </div>
    </section>
  );
}
