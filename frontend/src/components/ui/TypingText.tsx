import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

interface TypewriterOptions {
  speed: number;
  delay: number;
  startOnView: boolean;
  onDone?: () => void;
}

/** Quantidade de caracteres já digitados de um texto com `total` caracteres */
function useTypewriter<T extends HTMLElement>(
  total: number,
  { speed, delay, startOnView, onDone }: TypewriterOptions,
) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { amount: 0.6 });
  /** Qualquer parte visível: só apaga o texto depois que ele sai por completo da tela */
  const partlyVisible = useInView(ref);
  const reducedMotion = useReducedMotion();
  const [length, setLength] = useState(0);
  const [started, setStarted] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const canStart = !startOnView || inView;

  useEffect(() => {
    setLength(0);
    setStarted(false);
  }, [total]);

  // Redigita sempre que o elemento volta para a tela
  useEffect(() => {
    if (!startOnView || partlyVisible) return;
    setLength(0);
    setStarted(false);
  }, [startOnView, partlyVisible]);

  useEffect(() => {
    if (!canStart || started) return;
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [canStart, started, delay]);

  useEffect(() => {
    if (!started || length >= total) return;
    const timeout = setTimeout(() => setLength((prev) => prev + 1), speed);
    return () => clearTimeout(timeout);
  }, [started, length, total, speed]);

  const current = reducedMotion ? total : length;
  const done = current >= total;

  useEffect(() => {
    if (done) onDoneRef.current?.();
  }, [done]);

  return { ref, length: current, done };
}

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  /** Só começa a digitar quando o elemento entra na tela */
  startOnView?: boolean;
  onDone?: () => void;
  className?: string;
}

export function TypingText({
  text,
  speed = 75,
  delay = 0,
  startOnView = false,
  onDone,
  className,
}: TypingTextProps) {
  const { ref, length } = useTypewriter<HTMLSpanElement>(text.length, {
    speed,
    delay,
    startOnView,
    onDone,
  });

  return (
    <span ref={ref} className={cn("inline-flex items-baseline", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{text.slice(0, length)}</span>
      <span className="typing-cursor" aria-hidden />
    </span>
  );
}

interface TypingCommandProps {
  /** Comando principal, ex.: "ls" */
  command: string;
  /** Argumentos, ex.: " ./tools" */
  args?: string;
  /** Informação exibida após terminar de digitar, ex.: " · 12 packages" */
  suffix?: ReactNode;
  speed?: number;
  className?: string;
}

/** Linha de terminal `$ comando args` digitada quando entra na tela */
export function TypingCommand({
  command,
  args = "",
  suffix,
  speed = 45,
  className,
}: TypingCommandProps) {
  const full = command + args;
  const { ref, length, done } = useTypewriter<HTMLParagraphElement>(full.length, {
    speed,
    delay: 150,
    startOnView: true,
  });

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">$ {full}</span>
      <span aria-hidden>
        <span className="text-terminal">$ </span>
        <span className="text-accent">{command.slice(0, length)}</span>
        <span className="text-text-muted">{args.slice(0, Math.max(0, length - command.length))}</span>
        {!done && <span className="typing-cursor" />}
      </span>
      {suffix && (
        <span
          className={cn(
            "text-text-subtle transition-opacity duration-500",
            done ? "opacity-100" : "opacity-0",
          )}
        >
          {suffix}
        </span>
      )}
    </p>
  );
}
