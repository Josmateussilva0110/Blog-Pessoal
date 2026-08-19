import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "terminal-card p-6",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
