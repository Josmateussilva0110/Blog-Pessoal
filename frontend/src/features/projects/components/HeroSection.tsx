import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Image, DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import { SITE } from "@/config/constants";
import { usePublicProfileImage } from "@/features/profile/hooks/usePublicProfileImage";

export function HeroSection() {
  const { data: profileImage } = usePublicProfileImage();

  return (
    <section className="py-16 md:py-24">
      <div className="glass-strong rounded-3xl p-8 md:p-12 lg:p-14">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:gap-12 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
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

          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <Image
              src={profileImage?.url ?? DEFAULT_IMAGE_FALLBACK}
              alt={SITE.profileImageAlt}
              variant="avatar"
              size="5xl"
              frame
              glow
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
