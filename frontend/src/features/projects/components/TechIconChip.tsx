import { getSkillIconUrl, getTechMeta } from "@/lib/skillicons";

/** Chip de tecnologia com o ícone do skillicons (quando a tecnologia é conhecida) */
export function TechIconChip({ name }: { name: string }) {
  const meta = getTechMeta(name);

  return (
    <li className="inline-flex items-center gap-2 rounded-lg bg-home-inset py-1.5 pl-1.5 pr-2.5 font-mono text-xs text-home-ink">
      {meta.icon && (
        <img
          src={getSkillIconUrl(meta.icon)}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          className="size-5 rounded-[5px]"
        />
      )}
      {meta.label}
    </li>
  );
}
