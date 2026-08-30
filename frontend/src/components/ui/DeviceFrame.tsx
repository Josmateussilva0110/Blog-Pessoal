import type { ProjectPlatform } from "@blog/shared";
import { cn } from "@/lib/format";
import type { ReactNode } from "react";

interface DeviceFrameProps {
  platform: ProjectPlatform;
  children: ReactNode;
  className?: string;
  /** Versão reduzida para miniaturas da galeria */
  compact?: boolean;
}

function BrowserChrome({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border-subtle bg-surface-raised",
        compact ? "px-2 py-1" : "px-3 py-2 sm:px-4",
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        <span className={cn("rounded-full bg-red-500/80", compact ? "size-1.5" : "size-2")} />
        <span className={cn("rounded-full bg-amber-400/80", compact ? "size-1.5" : "size-2")} />
        <span className={cn("rounded-full bg-terminal/80", compact ? "size-1.5" : "size-2")} />
      </div>
    </div>
  );
}

function WebFrame({
  children,
  className,
  compact,
}: Omit<DeviceFrameProps, "platform">) {
  return (
    <div className={cn("mx-auto w-full", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-[#0a0a12] shadow-lg",
          compact ? "rounded-md" : "rounded-lg sm:rounded-xl",
        )}
      >
        <BrowserChrome compact={compact} />
        <div className={cn("bg-[#06060c]", compact ? "min-h-0" : "")}>{children}</div>
      </div>
      {!compact && (
        <div className="mt-2 flex flex-col items-center" aria-hidden>
          <div className="h-2 w-14 rounded-b-sm border border-t-0 border-border-subtle bg-surface-raised sm:w-16" />
          <div className="h-1 w-20 rounded-b bg-border-subtle sm:w-24" />
        </div>
      )}
    </div>
  );
}

function MobileFrame({
  children,
  className,
  compact,
}: Omit<DeviceFrameProps, "platform">) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        compact ? "max-w-full" : "max-w-[260px] sm:max-w-[300px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative border-2 border-border bg-[#0a0a12] shadow-lg",
          compact ? "rounded-[1rem] p-1" : "rounded-[2rem] p-2 sm:rounded-[2.25rem] sm:p-2.5",
        )}
      >
        <div
          className={cn(
            "absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#0a0a12]",
            compact ? "top-1.5 h-2.5 w-10" : "top-2.5 h-5 w-24 sm:top-3 sm:h-5 sm:w-28",
          )}
          aria-hidden
        />
        <div
          className={cn(
            "overflow-hidden bg-[#06060c]",
            compact ? "rounded-[0.65rem]" : "rounded-[1.35rem] sm:rounded-[1.5rem]",
          )}
        >
          {children}
        </div>
        {!compact && (
          <div
            className="mx-auto mt-2 h-1 w-20 rounded-full bg-border sm:mt-2.5 sm:w-24"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

export function DeviceFrame({
  platform,
  children,
  className,
  compact = false,
}: DeviceFrameProps) {
  if (platform === "mobile") {
    return (
      <MobileFrame className={className} compact={compact}>
        {children}
      </MobileFrame>
    );
  }

  return (
    <WebFrame className={className} compact={compact}>
      {children}
    </WebFrame>
  );
}
