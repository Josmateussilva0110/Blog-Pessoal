import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-surface-raised p-5",
        hover &&
          "transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_24px_rgb(34_211_238/0.08)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
