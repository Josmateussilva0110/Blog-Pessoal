import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "home-card p-6",
        hover && "transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-home-raised",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
