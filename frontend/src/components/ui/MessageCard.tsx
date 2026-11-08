import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type MessageCardProps = {
  message: string;
  /** "error" anuncia a mensagem para leitores de tela e usa a cor de erro */
  tone?: "neutral" | "error";
  /** Ações abaixo da mensagem (voltar, tentar de novo) */
  children?: ReactNode;
};

/** Card de página inteira para "não encontrado" ou falha ao carregar */
export function MessageCard({ message, tone = "neutral", children }: MessageCardProps) {
  const isError = tone === "error";

  return (
    <div className="pt-4 sm:pt-6">
      <div
        role={isError ? "alert" : undefined}
        className="home-card flex flex-col items-center gap-4 px-6 py-20 text-center"
      >
        <p className={cn(isError ? "text-danger-text" : "text-home-muted")}>{message}</p>
        {children && <div className="flex flex-wrap items-center justify-center gap-4">{children}</div>}
      </div>
    </div>
  );
}
