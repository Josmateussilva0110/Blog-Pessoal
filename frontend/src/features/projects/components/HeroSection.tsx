import { m } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Image, imageRadiusClass, type ImageRadius } from "@/components/ui/Image";
import { HOME_HERO, SITE } from "@/config/constants";
import { RevealText } from "@/components/ui/RevealText";
import { usePublicProfileImage } from "@/features/profile/hooks/usePublicProfileImage";
import { ROUTES, SECTION_IDS } from "@/config/routes";
import { isModifiedClick } from "@/lib/isModifiedClick";
import { prefersReducedMotion, scrollToProjectsSection } from "@/lib/viewTransition";

const MotionLink = m.create(Link);

// Base 0px (não o 0% do flex-1): a altura natural da foto não define a linha, o texto define
const PROFILE_PHOTO_CLASS =
  "aspect-[4/3] w-full flex-1 bg-home-inset object-[50%_30%] md:aspect-auto md:min-h-[18rem] md:basis-0";
// Raio pela prop do Image (o `cn` não resolve conflito com o rounded-none dele); 16px = 24px do card − 8px de padding
const PROFILE_PHOTO_RADIUS: ImageRadius = "2xl";
const PROFILE_PLACEHOLDER_CLASS = `${PROFILE_PHOTO_CLASS} ${imageRadiusClass(PROFILE_PHOTO_RADIUS)}`;

export function HeroSection() {
  const { data: profileImage } = usePublicProfileImage();
  const navigate = useNavigate();
  const location = useLocation();

  // O Link só troca a URL, sem rolar até a âncora: navega pelo router (o hash fica
  // no location dele) e rola até a seção
  function handleExploreClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) return;

    event.preventDefault();
    const alreadyThere = location.hash === `#${SECTION_IDS.projects}`;
    navigate(ROUTES.projectsSection, { replace: alreadyThere, preventScrollReset: true });
    scrollToProjectsSection(prefersReducedMotion() ? "instant" : "smooth");
  }

  // Duas colunas já no tablet: em coluna única a foto vira um quadrado maior que a tela
  return (
    <section className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* Sem altura mínima: a seção de projetos sobe para perto da dobra */}
      <div className="home-card flex flex-col justify-center p-6 sm:p-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-eyebrow text-home-muted">
          {HOME_HERO.eyebrow}
        </p>
        <RevealText
          as="h1"
          text={HOME_HERO.title}
          animated={false}
          className="mb-5 max-w-[48rem] text-4xl font-semibold leading-[1.02] tracking-display text-home-ink sm:text-5xl lg:text-6xl min-[90rem]:text-[4.25rem]"
        />
        <p className="max-w-[32rem] text-base leading-relaxed text-home-muted sm:text-[17px]">
          {HOME_HERO.description}
        </p>

        {/* No celular os dois não cabem lado a lado: empilhados e com a mesma largura */}
        <div className="mt-8 grid gap-2.5 sm:flex sm:flex-wrap">
          <MotionLink
            to={ROUTES.projectsSection}
            onClick={handleExploreClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={buttonClassName({ size: "cta" })}
          >
            Explorar projetos
            <ArrowDown className="size-4" aria-hidden />
          </MotionLink>
          <m.a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={buttonClassName({ variant: "outline", size: "cta" })}
          >
            GitHub
            <ArrowUpRight className="size-4" aria-hidden />
          </m.a>
        </div>
      </div>

      {/* "Sobre" no menu leva até a foto */}
      <figure
        id={SECTION_IDS.about}
        className="home-card m-0 flex scroll-mt-24 flex-col p-2 sm:scroll-mt-28"
      >
        {/* Enquanto os dados da foto chegam, só a área reservada: o SVG provisório seria
            baixado à toa e viraria candidato a LCP antes de ser trocado */}
        {profileImage ? (
          <Image
            src={profileImage.url}
            fallback={profileImage.fullUrl}
            srcSet={
              profileImage.hasImage && profileImage.url !== profileImage.fullUrl
                ? `${profileImage.url} 320w, ${profileImage.fullUrl} 800w`
                : undefined
            }
            sizes="(min-width: 768px) 30rem, 100vw"
            fetchPriority="high"
            alt={SITE.profileImageAlt}
            fit="cover"
            rounded={PROFILE_PHOTO_RADIUS}
            loading="eager"
            className={PROFILE_PHOTO_CLASS}
          />
        ) : (
          <div className={PROFILE_PLACEHOLDER_CLASS} aria-hidden />
        )}
        <figcaption className="flex items-center justify-between gap-2 px-3 pb-2 pt-3.5">
          <span className="font-semibold text-home-ink">{SITE.author}</span>
          <span className="font-mono text-xs text-home-muted">dev {SITE.role}</span>
        </figcaption>
      </figure>
    </section>
  );
}
