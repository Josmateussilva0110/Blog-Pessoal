import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Inclinação máxima em graus */
  max?: number;
}

const SPRING = { stiffness: 260, damping: 22, mass: 0.5 };

/**
 * Inclina o conteúdo em 3D seguindo o ponteiro, com uma sombra no "chão"
 * que desliza para o lado oposto à inclinação.
 */
export function TiltCard({ children, className, max = 12 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = canHover && !reducedMotion;

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const hover = useSpring(0, SPRING);

  const rotateX = useSpring(useTransform(pointerY, [0, 1], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-max, max]), SPRING);
  const scale = useTransform(hover, [0, 1], [1, 1.04]);
  const lift = useTransform(hover, [0, 1], [0, -8]);

  const shadowX = useTransform(rotateY, (v) => v * -1.6);
  const shadowScale = useTransform(hover, [0, 1], [0.85, 1]);

  function reset() {
    pointerX.set(0.5);
    pointerY.set(0.5);
    hover.set(0);
  }

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
    hover.set(1);
  }

  /** Card volta ao plano antes da view transition capturar o snapshot */
  function flatten() {
    for (const value of [pointerX, pointerY]) value.jump(0.5);
    for (const value of [rotateX, rotateY, hover]) value.jump(0);
  }

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onClickCapture={flatten}
    >
      <motion.div
        aria-hidden
        className="tilt-shadow"
        style={{ x: shadowX, scaleX: shadowScale, opacity: hover }}
      />
      <motion.div
        className="relative"
        style={{
          rotateX,
          rotateY,
          scale,
          y: lift,
          transformPerspective: 900,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
