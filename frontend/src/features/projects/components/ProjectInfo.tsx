import type { Project } from "@blog/shared";
import type { ReactNode } from "react";
import { StatusDot } from "@/features/projects/components/StatusDot";
import { TechChip } from "@/features/projects/components/TechChip";
import { formatDate } from "@/lib/format";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { getStatusLabel } from "@/lib/utils";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2.5">
      <dt className="text-xs text-text-subtle lg:text-sm">{label}</dt>
      <dd className="text-text lg:text-right">{children}</dd>
    </div>
  );
}

/** Informações rápidas do projeto: status, plataforma, datas e stack */
export function ProjectInfo({ project }: { project: Project }) {
  const status = normalizeProjectStatus(project.status);
  const platform = normalizeProjectPlatform(project.platform);

  return (
    <div className="project-card rounded-2xl p-5">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
        Sobre o projeto
      </p>
      <dl className="grid grid-cols-2 gap-x-4 lg:block lg:divide-y lg:divide-hairline-subtle">
        <InfoRow label="Status">
          <span className="inline-flex items-center gap-2">
            <StatusDot status={status} />
            {getStatusLabel(status)}
          </span>
        </InfoRow>
        <InfoRow label="Plataforma">{PLATFORM_LABELS[platform]}</InfoRow>
        <InfoRow label="Criado em">{formatDate(project.createdAt)}</InfoRow>
        <InfoRow label="Atualizado em">{formatDate(project.updatedAt)}</InfoRow>
      </dl>

      {project.techStack.length > 0 && (
        <div className="mt-4 border-t border-hairline-subtle pt-4">
          <p className="mb-2.5 text-sm text-text-subtle">Stack</p>
          <ul className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <TechChip key={tech}>{tech}</TechChip>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
