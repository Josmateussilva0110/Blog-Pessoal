import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { DEFAULT_STALE_TIME } from "@/config/cache";
import { AuthProvider } from "@/features/auth";

/**
 * Recursos de animação (variants, hover, inView, exit) chegam depois do primeiro paint:
 * os componentes usam `m.*` e o pacote completo do motion sai do chunk inicial
 */
const loadMotionFeatures = () => import("@/lib/motionFeatures").then((module) => module.default);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
