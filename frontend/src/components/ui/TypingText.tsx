import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypingText({ text, speed = 75, className }: TypingTextProps) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    setLength(0);
  }, [text]);

  useEffect(() => {
    if (length >= text.length) return;

    const timeout = setTimeout(() => {
      setLength((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [length, text, speed]);

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {text.slice(0, length)}
      <span className="typing-cursor" aria-hidden />
    </span>
  );
}
