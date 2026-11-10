import { useEffect, useRef, useState } from "react";

/**
 * Fica true quando o elemento chega perto da área visível e não volta mais a false:
 * serve para adiar trabalho caro (download, render) até ele ser necessário
 */
export function useNearViewport<T extends Element>(rootMargin = "400px") {
  const ref = useRef<T>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (isNear || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsNear(true);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isNear, rootMargin]);

  return { ref, isNear };
}
