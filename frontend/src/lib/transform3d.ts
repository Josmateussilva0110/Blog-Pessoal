import { useTransform, type MotionValue } from "motion/react";

type Transform3dValues = {
  perspective: number;
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
  rotateX?: MotionValue<number>;
  rotateY?: MotionValue<number>;
  /** Só `translateY`, sem 3D: dentro de camada 3D o Chrome borra prints em telas DPR 1 */
  flat?: boolean;
};

// Abaixo disso o valor conta como repouso (px, fator de escala e graus)
const REST_EPSILON = { translate: 0.05, scale: 0.0005, rotate: 0.01 };

const near = (value: number, target: number, epsilon: number) =>
  Math.abs(value - target) < epsilon;

/**
 * Monta o transform 3D, mas devolve `none` quando o elemento está em repouso.
 * Com `perspective()` o elemento vira uma camada 3D e o Chrome reduz imagens
 * com um filtro mais simples (prints ficam levemente sem foco); em repouso,
 * sem transform, ele usa o filtro de melhor qualidade.
 */
export function useRestingTransform({
  perspective,
  y,
  scale,
  rotateX,
  rotateY,
  flat = false,
}: Transform3dValues) {
  // `useTransform` só assina os valores lidos: no modo plano, escala e rotação
  // nem são recalculados a cada frame
  return useTransform(() => {
    const ty = y?.get() ?? 0;
    const atRestY = near(ty, 0, REST_EPSILON.translate);

    if (flat) {
      // 2D, não translate3d: no Chrome/Brave a camada 3D cobria o painel seguinte
      return atRestY ? "none" : `translateY(${ty}px)`;
    }

    const s = scale?.get() ?? 1;
    const rx = rotateX?.get() ?? 0;
    const ry = rotateY?.get() ?? 0;

    if (
      atRestY &&
      near(s, 1, REST_EPSILON.scale) &&
      near(rx, 0, REST_EPSILON.rotate) &&
      near(ry, 0, REST_EPSILON.rotate)
    ) {
      return "none";
    }

    return `perspective(${perspective}px) translateY(${ty}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
}
