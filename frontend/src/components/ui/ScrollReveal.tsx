import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { useSkipEntrance } from "@/lib/motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Inclina e esmaece a seção quando ela sai pelo topo da tela */
  exit?: boolean;
};

const SMOOTH = { stiffness: 140, damping: 26, mass: 0.35 };

function mix(from: number, to: number, progress: MotionValue<number>) {
  return from + (to - from) * progress.get();
}

/**
 * Painel ligado ao scroll: entra de baixo inclinado para trás e cresce,
 * e ao sair tomba para frente e esmaece.
 */
export function ScrollReveal({ children, className, exit = true }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const skipEntrance = useSkipEntrance();
  const reducedMotion = useReducedMotion();

  const { scrollYProgress: enterRaw } = useScroll({
    target: ref,
    offset: ["start end", "start 0.55"],
  });
  const { scrollYProgress: exitRaw } = useScroll({
    target: ref,
    offset: ["end 0.5", "end start"],
  });
  const enter = useSpring(enterRaw, SMOOTH);
  const leave = useSpring(exitRaw, SMOOTH);
  const leaveAmount = exit ? 1 : 0;

  const rotateX = useTransform(
    () => mix(18, 0, enter) + mix(0, -14, leave) * leaveAmount,
  );
  const scale = useTransform(
    () => mix(0.88, 1, enter) - mix(0, 0.08, leave) * leaveAmount,
  );
  const y = useTransform(() => mix(90, 0, enter));
  const opacity = useTransform(
    () => mix(0.15, 1, enter) - mix(0, 0.7, leave) * leaveAmount,
  );

  // Mesmo elemento nos dois casos: ao religar o efeito nada é remontado, e as
  // springs já estão acompanhando o scroll, então não há salto
  const animated = !skipEntrance && !reducedMotion;

  // Ao religar (volta de um projeto), começa já na posição atual do scroll,
  // sem a spring "correr atrás" de um valor antigo
  useEffect(() => {
    if (!animated) return;
    enter.jump(enterRaw.get());
    leave.jump(exitRaw.get());
  }, [animated, enter, enterRaw, leave, exitRaw]);

  return (
    <motion.div
      ref={ref}
      className={cn("scroll-panel", className)}
      style={
        animated
          ? {
              rotateX,
              scale,
              y,
              opacity,
              transformPerspective: 1400,
              transformOrigin: "50% 50%",
              willChange: "transform, opacity",
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
