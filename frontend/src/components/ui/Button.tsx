import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "danger-ghost";
type ButtonSize = "sm" | "md" | "lg" | "cta" | "icon";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Mesmos botões do site público: claro para a ação principal, cinza neutro para o resto.
// `cn` só junta classes (sem tailwind-merge): cores e espaçamentos mudam por variante/tamanho,
// não sobrescrevendo pelo className, senão quem vence é a ordem do CSS gerado
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-home-ink text-home-device hover:bg-home-ink-strong",
  secondary: "bg-home-inset text-home-ink hover:bg-home-raised",
  ghost: "text-home-muted hover:bg-home-inset hover:text-home-ink",
  outline: "border border-home-line text-home-ink hover:bg-home-inset",
  // Ações destrutivas: confirmação (cheio) e atalho em listas (só texto)
  danger: "bg-danger-solid text-home-ink-strong hover:bg-danger-solid-hover",
  "danger-ghost": "text-danger-text hover:bg-danger/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs rounded-lg",
  md: "min-h-10 px-4 text-sm rounded-xl",
  lg: "min-h-12 px-5 text-sm rounded-xl",
  // Chamada principal do site público (hero, destaque, detalhe do projeto)
  cta: "min-h-12 px-5 text-cta rounded-xl",
  icon: "size-9 rounded-lg",
};

/** Classes do botão, para links com cara de botão (um <Link> não pode conter um <button>) */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
