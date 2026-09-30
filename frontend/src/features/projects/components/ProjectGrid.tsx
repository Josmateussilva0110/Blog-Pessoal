import type { Project } from "@blog/shared";
import { motion } from "motion/react";
import { TiltCard } from "@/components/ui/TiltCard";
import { cardRise, staggerContainer, useInViewReveal } from "@/lib/motion";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  title?: string;
  /** "large": cards maiores em 2 colunas, usados nos destaques */
  size?: "default" | "large";
}

export function ProjectGrid({
  projects,
  title,
  size = "default",
}: ProjectGridProps) {
  const reveal = useInViewReveal<HTMLDivElement>();

  if (projects.length === 0) {
    return (
      <p className="font-mono text-sm text-text-muted">
        // nenhum projeto encontrado
      </p>
    );
  }

  const isLarge = size === "large";
  const gridClass = isLarge
    ? "grid gap-6 md:grid-cols-2"
    : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section>
      {title && (
        <h2 className="font-mono text-sm text-accent mb-6">{title}</h2>
      )}
      <motion.div
        className={gridClass}
        ref={reveal.ref}
        variants={staggerContainer}
        initial={reveal.initial}
        animate={reveal.animate}
      >
        {projects.map((project) => (
          // Anima o wrapper, não o <article> com viewTransitionName do card
          <motion.div key={project.id} variants={cardRise} whileTap={{ scale: 0.98 }}>
            <TiltCard className="h-full" max={isLarge ? 7 : 9}>
              <ProjectCard project={project} size={size} />
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
