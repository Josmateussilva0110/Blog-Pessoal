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
import { useRestingTransform } from "@/lib/transform3d";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Entra de baixo inclinada; desligar em seções acima da dobra (ex.: hero) */
  enter?: boolean;
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
export function ScrollReveal({
  children,
  className,
  enter: enterEnabled = true,
  exit = true,
}: ScrollRevealProps) {
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
  // Sem entrada, a seção já começa no estado final (sem atrasar o primeiro paint)
  const entered = (from: number, to: number) => (enterEnabled ? mix(from, to, enter) : to);

  const rotateX = useTransform(
    () => entered(18, 0) + mix(0, -14, leave) * leaveAmount,
  );
  const scale = useTransform(
    () => entered(0.88, 1) - mix(0, 0.08, leave) * leaveAmount,
  );
  const y = useTransform(() => entered(90, 0));
  const opacity = useTransform(
    () => entered(0.15, 1) - mix(0, 0.7, leave) * leaveAmount,
  );

  const transform = useRestingTransform({ perspective: 1400, y, scale, rotateX });

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
              transform,
              opacity,
              transformOrigin: "50% 50%",
              // Sem will-change: com ele o Chrome congela a resolução do desenho
              // na escala de entrada (0.88) e o conteúdo fica sem foco em escala 1
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
