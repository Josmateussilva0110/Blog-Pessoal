import type { Transition, Variants } from "motion/react";
import { useLocation } from "react-router-dom";
import type { HomeLocationState } from "@/lib/viewTransition";

/** Mesmo easing usado nas transições CSS do site */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const hoverSpring: Transition = { type: "spring", stiffness: 300, damping: 24 };

export const inViewOnce = { once: true, amount: 0.15 } as const;

/**
 * Ao voltar da página de um projeto para a home, o conteúdo já deve estar
 * visível para a transição de retorno não mirar em elementos ocultos.
 */
export function useSkipEntrance() {
  const location = useLocation();
  const state = location.state as HomeLocationState | null;
  return state?.scrollTo === "projetos";
}
