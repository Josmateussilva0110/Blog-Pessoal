import { Link } from "react-router-dom";
import { Image, DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import { TerminalWindow, TerminalWindowBar } from "@/components/ui/TerminalWindow";
import { SITE } from "@/config/constants";
import { usePublicProfileImage } from "@/features/profile/hooks/usePublicProfileImage";
import { useHeroStats } from "@/features/site-settings/hooks/useHeroStats";

interface HeroSectionProps {
  projectCount?: number;
  isLoading?: boolean;
}

export function HeroSection({ projectCount = 0, isLoading = false }: HeroSectionProps) {
  const { data: profileImage } = usePublicProfileImage();
  const { data: heroStats } = useHeroStats();
  const countLabel = isLoading ? "—" : String(projectCount);

  return (
    <section className="py-16 md:py-24 lg:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 items-start">
        <div className="order-2 md:order-1 max-w-3xl">
          <TerminalWindow path="~/index.md" bodyClassName="p-6 md:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 border border-terminal/30 rounded px-3 py-1 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-terminal animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-terminal">
                online — open source
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="code-comment">// dev blog</p>
              <span className="font-mono text-[10px] text-accent bg-accent-soft border border-accent/20 px-2.5 py-1 rounded">
                --{SITE.role}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
              Código que <span className="text-accent">cria</span> coisas.
            </h1>

            <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-xl mb-10">
              {SITE.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
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
              <p className="code-comment mb-4">// stats</p>
              <div className="grid grid-cols-3 gap-8 max-w-md">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-text">{countLabel}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-subtle mt-1">
                    projetos
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-text">
                    {heroStats?.yearsCoding ?? 4}+
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
          </TerminalWindow>
        </div>

        <div className="order-1 md:order-2 flex justify-center md:justify-end md:pt-6">
          <div className="terminal-card w-full max-w-[280px] sm:max-w-[300px] overflow-hidden">
            <TerminalWindowBar path="~/avatar.jpg" />

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
