import type { ReactNode } from "react";
import { LightboxShell } from "@/components/ui/LightboxShell";

type ChartLightboxProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function ChartLightbox({ open, title, onClose, children }: ChartLightboxProps) {
  if (!open) return null;

  return (
    <LightboxShell
      label={title}
      backdropLabel="Fechar gráfico"
      onClose={onClose}
      caption={<p className="font-mono text-xs text-home-body sm:text-sm">{title}</p>}
      className="max-w-6xl gap-3 sm:gap-4 sm:p-5"
    >
      {children}
    </LightboxShell>
  );
}
