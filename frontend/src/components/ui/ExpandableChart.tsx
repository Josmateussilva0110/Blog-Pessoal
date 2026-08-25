import { useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { ChartLightbox } from "@/components/ui/ChartLightbox";
import { cn } from "@/lib/format";

type ExpandableChartProps = {
  title: string;
  preview: ReactNode;
  fullscreen: ReactNode;
  className?: string;
};

export function ExpandableChart({
  title,
  preview,
  fullscreen,
  className,
}: ExpandableChartProps) {
  const [open, setOpen] = useState(false);

  function openFullscreen() {
    setOpen(true);
  }

  return (
    <>
      <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
        <div className="flex items-center justify-end">
          <button
            type="button"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent/35 bg-accent-soft px-2.5 py-1 font-mono text-[10px] text-accent transition-colors",
              "hover:border-accent/50 hover:bg-accent/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            )}
            onClick={openFullscreen}
          >
            <Maximize2 className="size-3.5" aria-hidden />
            fullscreen()
          </button>
        </div>

        <button
          type="button"
          className="w-full min-w-0 text-left md:cursor-default md:pointer-events-none"
          aria-label={`Ampliar gráfico: ${title}`}
          onClick={openFullscreen}
        >
          {preview}
        </button>
      </div>

      <ChartLightbox open={open} title={title} onClose={() => setOpen(false)}>
        {fullscreen}
      </ChartLightbox>
    </>
  );
}
