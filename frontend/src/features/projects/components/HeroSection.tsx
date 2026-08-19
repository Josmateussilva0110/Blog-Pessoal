import { Link } from "react-router-dom";
import { Image, DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import { SITE } from "@/config/constants";
import { usePublicProfileImage } from "@/features/profile/hooks/usePublicProfileImage";

interface HeroSectionProps {
  projectCount?: number;
}

export function HeroSection({ projectCount = 0 }: HeroSectionProps) {
  const { data: profileImage } = usePublicProfileImage();
  const count = projectCount > 0 ? `${projectCount}+` : "—";

  return (
    <section className="py-16 md:py-24 lg:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 items-start">
        <div className="order-2 md:order-1 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-terminal/30 rounded px-3 py-1 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-terminal animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-terminal">
              online — open source
            </span>
          </div>

          <p className="code-comment mb-4">// dev blog</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
            Código que <span className="text-accent">cria</span> coisas.
          </h1>

          <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-xl mb-10">
            {SITE.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Link
              to="/#projetos"
              className="inline-flex items-center font-mono text-sm font-medium bg-accent text-surface px-6 py-3 btn-terminal hover:bg-accent-muted transition-colors"
            >
              ver_projetos()
            </Link>
            <a
              href="/#sobre"
              className="inline-flex items-center font-mono text-sm text-text-muted border border-border-subtle px-5 py-3 hover:text-text hover:border-border transition-colors"
            >
              about --me
            </a>
          </div>

          <div className="border-t border-border-subtle pt-8">
            <div className="grid grid-cols-3 gap-8 max-w-md">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-text">{count}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-subtle mt-1">
                  projetos
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-text">
                  {SITE.stats.yearsCoding}+
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-subtle mt-1">
                  anos codando
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-accent">∞</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-subtle mt-1">
                  café
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center md:justify-end md:pt-6">
          <div className="terminal-card w-full max-w-[280px] sm:max-w-[300px] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-terminal/80" />
              <span className="font-mono text-[11px] ml-2 truncate">
                <span className="text-terminal">mateus@dev</span>
                <span className="text-text-subtle">:</span>
                <span className="text-accent">~/avatar.jpg</span>
              </span>
            </div>

            <div className="p-3">
              <div className="relative overflow-hidden rounded-md border border-accent/15 bg-surface">
                <Image
                  src={profileImage?.url ?? DEFAULT_IMAGE_FALLBACK}
                  alt={SITE.profileImageAlt}
                  width={280}
                  height={280}
                  fit="cover"
                  rounded="md"
                  loading="eager"
                  className="w-full aspect-square"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(34_211_238/0.03)_50%)] bg-[length:100%_4px]"
                  aria-hidden
                />
              </div>
            </div>

            <div className="px-4 pb-4 space-y-1.5">
              <p className="font-mono text-[11px]">
                <span className="text-terminal">$ </span>
                <span className="text-accent">file</span>
                <span className="text-text-muted"> avatar.jpg</span>
              </p>
              <p className="font-mono text-[10px] text-text-subtle">
                image/jpeg · 1:1 · profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
