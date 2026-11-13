import {
  m,
  useReducedMotion,
  useScroll,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSkipEntrance } from "@/lib/motion";
import { useRestingTransform } from "@/lib/transform3d";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Entra de baixo inclinada; desligar em seções acima da dobra (ex.: hero) */
  enter?: boolean;
  /** Inclina e esmaece a seção quando ela sai pelo topo da tela (com `flat`, só esmaece) */
  exit?: boolean;
  /** Só desliza e esmaece, sem 3D: para seções com prints (ver `useRestingTransform`) */
  flat?: boolean;
};

// Mola mais lenta e sem quique: os cards deslizam em vez de "pular" para a posição
const SMOOTH = { stiffness: 90, damping: 26, mass: 0.6 };

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
  flat = false,
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
  // Sem entrada (hero), a mola não acompanha o scroll à toa: segue um valor fixo.
  // `enter` não muda durante a vida do componente, então a fonte da mola também não
  const enteredValue = useMotionValue(1);
  const enter = useSpring(enterEnabled ? enterRaw : enteredValue, SMOOTH);
  const leave = useSpring(exitRaw, SMOOTH);
  const leaveAmount = exit ? 1 : 0;
  // Sem entrada, a seção já começa no estado final (sem atrasar o primeiro paint)
  const entered = (from: number, to: number) => (enterEnabled ? mix(from, to, enter) : to);

  const rotateX = useTransform(
    () => entered(7, 0) + mix(0, -5, leave) * leaveAmount,
  );
  const scale = useTransform(
    () => entered(0.96, 1) - mix(0, 0.03, leave) * leaveAmount,
  );
  const y = useTransform(() => entered(40, 0));
  const opacity = useTransform(
    () => entered(0.3, 1) - mix(0, 0.45, leave) * leaveAmount,
  );

  const transform = useRestingTransform({ perspective: 1400, y, scale, rotateX, flat });

  // Mesmo elemento nos dois casos: ao religar o efeito nada é remontado, e as
  // springs já estão acompanhando o scroll, então não há salto
  const animated = !skipEntrance && !reducedMotion;

  // Ao religar (volta de um projeto), começa já na posição atual do scroll,
  // sem a spring "correr atrás" de um valor antigo
  useEffect(() => {
    if (!animated) return;
    enter.jump(enterEnabled ? enterRaw.get() : 1);
    leave.jump(exitRaw.get());
  }, [animated, enterEnabled, enter, enterRaw, leave, exitRaw]);

  return (
    <m.div
      ref={ref}
      className={cn("scroll-panel", className)}
      style={
        animated
          ? {
              transform,
              opacity,
              transformOrigin: "50% 50%",
              // Sem will-change: com ele o Chrome congela a resolução do desenho
              // na escala de entrada (0.96) e o conteúdo fica sem foco em escala 1
            }
          : undefined
      }
    >
      {children}
    </m.div>
  );
}
