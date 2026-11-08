import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HERO_YEARS_CODING_MAX, heroStatsSchema, type HeroStats } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import {
  useHeroStats,
  useUpdateHeroStats,
} from "@/features/site-settings/hooks/useHeroStats";

export function HeroStatsForm() {
  const toast = useToast();
  const { data, isError, isRefetching, refetch } = useHeroStats();
  const updateHeroStats = useUpdateHeroStats();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroStats>({ resolver: zodResolver(heroStatsSchema) });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  async function onSubmit(values: HeroStats) {
    try {
      await updateHeroStats.mutateAsync(values);
      toast.success("Estatísticas da hero atualizadas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  }

  if (!data) {
    return isError ? (
      <ErrorState
        message="Não foi possível carregar as estatísticas."
        onRetry={() => void refetch()}
        isRetrying={isRefetching}
      />
    ) : (
      <p role="status" className="animate-pulse text-sm text-home-muted">
        Carregando estatísticas…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Anos codando"
        type="number"
        min={0}
        max={HERO_YEARS_CODING_MAX}
        error={errors.yearsCoding?.message}
        {...register("yearsCoding", { valueAsNumber: true })}
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={updateHeroStats.isPending}>
          {updateHeroStats.isPending ? "Salvando..." : "Salvar estatísticas"}
        </Button>
      </div>
    </form>
  );
}
