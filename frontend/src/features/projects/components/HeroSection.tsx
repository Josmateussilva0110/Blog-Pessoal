import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Image, DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import { HOME_HERO, SITE } from "@/config/constants";
import { RevealText } from "@/components/ui/RevealText";
import { usePublicProfileImage } from "@/features/profile/hooks/usePublicProfileImage";
import { ROUTES, SECTION_IDS } from "@/config/routes";

const MotionLink = motion.create(Link);

export function HeroSection() {
  const { data: profileImage } = usePublicProfileImage();

  // Duas colunas já no tablet: em coluna única a foto vira um quadrado maior que a tela
  return (
    <section className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="home-card flex min-h-[24rem] flex-col justify-between gap-10 p-6 sm:min-h-[27.5rem] sm:p-10">
        <div>
          <RevealText
            as="h1"
            text={HOME_HERO.title}
            animated={false}
            className="mb-5 max-w-[42rem] text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-home-ink sm:text-5xl lg:text-6xl"
          />
          <p className="max-w-[32rem] text-base leading-relaxed text-home-muted sm:text-[17px]">
            {HOME_HERO.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <MotionLink
            to={ROUTES.projectsSection}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={buttonClassName({ size: "cta" })}
          >
            Explorar projetos
            <ArrowDown className="size-4" aria-hidden />
          </MotionLink>
        </div>
      </div>

      {/* "Sobre" no menu leva até a foto */}
      <figure
        id={SECTION_IDS.about}
        className="home-card m-0 flex scroll-mt-24 flex-col p-2 sm:scroll-mt-28"
      >
        <Image
          src={profileImage?.url ?? DEFAULT_IMAGE_FALLBACK}
          fallback={profileImage?.fullUrl ?? DEFAULT_IMAGE_FALLBACK}
          srcSet={
            profileImage?.hasImage && profileImage.url !== profileImage.fullUrl
              ? `${profileImage.url} 320w, ${profileImage.fullUrl} 800w`
              : undefined
          }
          sizes="(min-width: 768px) 30rem, 100vw"
          fetchPriority="high"
          alt={SITE.profileImageAlt}
          fit="cover"
          rounded="none"
          loading="eager"
          className="aspect-[4/3] w-full flex-1 rounded-[1.125rem] bg-home-inset object-[50%_30%] md:aspect-auto md:min-h-[18rem]"
        />
        <figcaption className="flex items-center justify-between gap-2 px-3 pb-2 pt-3.5">
          <span className="font-semibold text-home-ink">{SITE.author}</span>
          <span className="font-mono text-xs text-home-muted">dev {SITE.role}</span>
        </figcaption>
      </figure>
    </section>
  );
}
