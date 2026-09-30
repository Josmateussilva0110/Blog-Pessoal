import { useTransform, type MotionValue } from "motion/react";

type Transform3dValues = {
  perspective: number;
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
  rotateX?: MotionValue<number>;
  rotateY?: MotionValue<number>;
};

const near = (value: number, target: number, epsilon: number) =>
  Math.abs(value - target) < epsilon;

/**
 * Monta o transform 3D, mas devolve `none` quando o elemento está em repouso.
 * Com `perspective()` o elemento vira uma camada 3D e o Chrome reduz imagens
 * com um filtro mais simples (prints ficam levemente sem foco); em repouso,
 * sem transform, ele usa o filtro de melhor qualidade.
 */
export function useRestingTransform({ perspective, y, scale, rotateX, rotateY }: Transform3dValues) {
  return useTransform(() => {
    const ty = y?.get() ?? 0;
    const s = scale?.get() ?? 1;
    const rx = rotateX?.get() ?? 0;
    const ry = rotateY?.get() ?? 0;

    if (near(ty, 0, 0.05) && near(s, 1, 0.0005) && near(rx, 0, 0.01) && near(ry, 0, 0.01)) {
      return "none";
    }

    return `perspective(${perspective}px) translateY(${ty}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
}
