import { useEffect, useState } from "react";

export function useScrollThreshold(threshold = 0.7) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setIsPastThreshold(false);
        return;
      }

      setIsPastThreshold(window.scrollY / scrollableHeight >= threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [threshold]);

  return isPastThreshold;
}
