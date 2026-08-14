import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/config/constants";

export function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="glass-strong rounded-3xl p-10 md:p-14 max-w-3xl">
        <p className="text-sm font-medium text-accent mb-4">
          Desenvolvedor full-stack
        </p>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gradient">
          {SITE.name}
        </h1>

        <p className="text-lg text-text-muted leading-relaxed max-w-xl mb-10">
          {SITE.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link to="/#projetos">
            <Button size="lg">Ver projetos</Button>
          </Link>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              GitHub
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
