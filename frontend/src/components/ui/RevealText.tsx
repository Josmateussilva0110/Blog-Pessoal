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
}

// Só transformações 2D: blur + rotação 3D no mesmo elemento gera artefatos
// de renderização no Chrome (feixes/cunhas brancas durante a animação)
const word: Variants = {
  hidden: {
    opacity: 0,
    y: "0.6em",
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
};

function stripPunctuation(value: string) {
  return value.replace(/[.,!?;:]/g, "");
}

/** Revela o texto palavra por palavra, subindo e saindo do desfoque. */
export function RevealText({
  text,
  as = "h2",
  className,
  accent = [],
  delay = 0,
}: RevealTextProps) {
  const reveal = useInViewReveal<HTMLHeadingElement>(0.5);
  const Tag = MOTION_TAGS[as];
  const words = text.split(" ");

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
              accent.includes(stripPunctuation(value)) && "text-accent",
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
