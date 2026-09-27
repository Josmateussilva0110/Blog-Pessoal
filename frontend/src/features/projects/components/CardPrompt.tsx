import type { CSSProperties } from "react";
import { cn } from "@/lib/format";

interface CardPromptProps {
  command: string;
  className?: string;
}

/** Prompt que "digita" o comando quando o card (.group) recebe hover ou foco. */
export function CardPrompt({ command, className }: CardPromptProps) {
  return (
    <p className={cn("card-prompt font-mono text-[11px] text-text-muted", className)}>
      <span className="text-terminal">{"$\u00a0"}</span>
      <span
        className="card-prompt-text"
        style={{ "--prompt-chars": command.length } as CSSProperties}
      >
        {command}
      </span>
      <span className="typing-cursor text-accent" aria-hidden />
    </p>
  );
}
