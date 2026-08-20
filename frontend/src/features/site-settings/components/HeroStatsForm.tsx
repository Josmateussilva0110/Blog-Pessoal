import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import {
  useHeroStats,
  useUpdateHeroStats,
} from "@/features/site-settings/hooks/useHeroStats";

export function HeroStatsForm() {
  const toast = useToast();
  const { data, isLoading } = useHeroStats();
  const updateHeroStats = useUpdateHeroStats();
  const [yearsCoding, setYearsCoding] = useState("4");

  useEffect(() => {
    if (data) {
      setYearsCoding(String(data.yearsCoding));
    }
  }, [data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = Number(yearsCoding);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 50) {
      toast.error("Informe um número inteiro entre 0 e 50.");
      return;
    }

    try {
      await updateHeroStats.mutateAsync({ yearsCoding: parsed });
      toast.success("Estatísticas da hero atualizadas.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Anos codando"
        type="number"
        min={0}
        max={50}
        value={yearsCoding}
        onChange={(event) => setYearsCoding(event.target.value)}
        placeholder="4"
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="font-mono"
          disabled={isLoading || updateHeroStats.isPending}
        >
          {updateHeroStats.isPending ? "Salvando..." : "save_stats()"}
        </Button>
      </div>
    </form>
  );
}
