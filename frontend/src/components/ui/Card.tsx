import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        hover &&
          "transition-all duration-300 hover:bg-blue-950/40 hover:border-blue-400/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/15",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
