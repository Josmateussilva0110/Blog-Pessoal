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
        // Mesmo card translúcido da barra do topo
        "fixed bottom-5 right-4 z-50 flex min-h-11 items-center gap-1.5 rounded-xl border border-home-line bg-home-card/85 pl-3 pr-4 text-sm font-medium text-home-ink backdrop-blur-md transition-[opacity,transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-home-inset focus-visible:outline-2 focus-visible:outline-brand sm:bottom-6 sm:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ChevronUp className="size-4" strokeWidth={2.25} aria-hidden />
      Topo
    </button>
  );
}
