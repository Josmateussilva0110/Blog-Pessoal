import { cn } from "@/lib/format";
import { useScrollThreshold } from "@/hooks/useScrollThreshold";
import { ChevronUp } from "lucide-react";

interface ScrollToTopButtonProps {
  threshold?: number;
}

export function ScrollToTopButton({ threshold = 0.7 }: ScrollToTopButtonProps) {
  const visible = useScrollThreshold(threshold);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full glass-strong border border-accent/20 text-accent shadow-lg shadow-accent/10 transition-all duration-300 hover:bg-accent-soft hover:border-accent/35",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
    </button>
  );
}
