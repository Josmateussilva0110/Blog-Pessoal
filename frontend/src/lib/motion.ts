import type { Transition, Variants } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import type { HomeLocationState } from "@/lib/viewTransition";
import { SECTION_IDS } from "@/config/routes";

/** Mesmo easing usado nas transições CSS do site */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/**
 * Entrada dos cards: sobem e crescem. Sem rotação 3D, porque já ficam dentro
 * de um painel inclinado e 3D aninhado gera artefatos de renderização no Chrome.
 */
export const cardRise: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const hoverSpring: Transition = { type: "spring", stiffness: 300, damping: 24 };

/** Reanima sempre que o elemento volta para a tela */
export const inViewRepeat = { once: false, amount: 0.15 } as const;

/**
 * Ao voltar da página de um projeto para a home, o conteúdo já deve estar
 * visível para a transição de retorno não mirar em elementos ocultos.
 */
export function useSkipEntrance() {
  const location = useLocation();
  const state = location.state as HomeLocationState | null;
  return state?.scrollTo === SECTION_IDS.projects;
}

/**
 * Estado de entrada controlado pela visibilidade: anima sempre que o elemento
 * entra na tela e volta a esconder quando sai. Na volta de um projeto começa
 * visível e passa a reanimar assim que a transição de retorno termina.
 */
export function useInViewReveal<T extends Element>(amount = 0.15) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { amount });
  const skipEntrance = useSkipEntrance();

  return {
    ref,
    initial: skipEntrance ? (false as const) : "hidden",
    animate: skipEntrance || inView ? "show" : "hidden",
  };
}
