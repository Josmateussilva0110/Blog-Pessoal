import type { Project } from "@blog/shared";
import type { ReactNode } from "react";
import { StatusDot } from "@/features/projects/components/StatusDot";
import { PROJECT_UPDATES_SECTION_ID } from "@/features/projects/components/ProjectUpdates";
import { formatDate } from "@/lib/format";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { getStatusLabel } from "@/lib/projectStatus";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-home-card px-5 py-4">
      <dt className="text-caption text-home-muted">{label}</dt>
      <dd className="mt-1 font-medium text-home-ink">{children}</dd>
    </div>
  );
}

/** Faixa de dados do projeto no topo da página: status, plataforma e datas */
export function ProjectFacts({ project }: { project: Project }) {
  const status = normalizeProjectStatus(project.status);
  const platform = normalizeProjectPlatform(project.platform);
  const latestUpdate = project.updates?.[0];

  return (
    // Linhas de 1px entre os itens: fundo da grade aparecendo pelo gap
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-home-line bg-home-line lg:grid-cols-4">
      <Fact label="Status">
        <span className="inline-flex items-center gap-2">
          <StatusDot status={status} />
          {getStatusLabel(status)}
        </span>
      </Fact>
      <Fact label="Plataforma">{PLATFORM_LABELS[platform]}</Fact>
      <Fact label="Criado em">{formatDate(project.createdAt)}</Fact>
      {/* Sempre presente (sem atualizações cai na data do projeto): a altura da
          faixa não muda quando o detalhe completo substitui os dados da home */}
      <Fact label="Última atualização">
        {latestUpdate ? (
          <a
            href={`#${PROJECT_UPDATES_SECTION_ID}`}
            className="text-brand underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand"
          >
            {latestUpdate.version ?? formatDate(latestUpdate.publishedAt)}
          </a>
        ) : (
          formatDate(project.updatedAt)
        )}
      </Fact>
    </dl>
  );
}
