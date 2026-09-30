import { motion, type Variants } from "motion/react";
import { Fragment } from "react";
import { cn } from "@/lib/format";
import { EASE_OUT, useInViewReveal } from "@/lib/motion";

type RevealTag = "h1" | "h2" | "h3" | "p";

interface RevealTextProps {
  text: string;
  as?: RevealTag;
  className?: string;
  /** Palavras destacadas com a cor de acento */
  accent?: string[];
  /** Atraso em segundos antes da primeira palavra */
  delay?: number;
  /** Desligar para textos acima da dobra (ex.: <h1> do hero), que devem aparecer no primeiro paint */
  animated?: boolean;
}

// Sem filter: blur — o texto fica dentro dos painéis com transform 3D do
// ScrollReveal, e filtro + rotação 3D gera artefatos no Chrome
const word: Variants = {
  hidden: {
    opacity: 0,
    y: "0.6em",
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const STATIC_TAGS = { h1: "h1", h2: "h2", h3: "h3", p: "p" } as const;

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
};

function stripPunctuation(value: string) {
  return value.replace(/[.,!?;:]/g, "");
}

/** Revela o texto palavra por palavra, subindo e surgindo. */
export function RevealText({
  text,
  as = "h2",
  className,
  accent = [],
  delay = 0,
  animated = true,
}: RevealTextProps) {
  const reveal = useInViewReveal<HTMLHeadingElement>(0.5);
  const Tag = MOTION_TAGS[as];
  const words = text.split(" ");
  const isAccent = (value: string) => accent.includes(stripPunctuation(value));

  if (!animated) {
    const StaticTag = STATIC_TAGS[as];
    return (
      <StaticTag className={className}>
        {words.map((value, index) => (
          <Fragment key={`${value}-${index}`}>
            {isAccent(value) ? <span className="text-accent">{value}</span> : value}
            {index < words.length - 1 && " "}
          </Fragment>
        ))}
      </StaticTag>
    );
  }

  return (
    <Tag
      className={className}
      aria-label={text}
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {words.map((value, index) => (
        <Fragment key={`${value}-${index}`}>
          <motion.span
            aria-hidden
            variants={word}
            className={cn(
              "inline-block",
              isAccent(value) && "text-accent",
            )}
          >
            {value}
          </motion.span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
