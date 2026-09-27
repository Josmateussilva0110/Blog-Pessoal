import type { Project } from "@blog/shared";
import { motion } from "motion/react";
import {
  fadeUp,
  hoverSpring,
  inViewOnce,
  staggerContainer,
  useSkipEntrance,
} from "@/lib/motion";
import { FloppyProjectCard } from "./FloppyProjectCard";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  title?: string;
  columns?: 2 | 3;
  variant?: "window" | "floppy";
}

export function ProjectGrid({
  projects,
  title,
  columns = 2,
  variant = "window",
}: ProjectGridProps) {
  const skipEntrance = useSkipEntrance();

  if (projects.length === 0) {
    return (
      <p className="font-mono text-sm text-text-muted">
        // nenhum projeto encontrado
      </p>
    );
  }

  const isFloppy = variant === "floppy";
  const gridClass = isFloppy
    ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    : columns === 3
      ? "grid gap-4 md:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2";
  const CardComponent = isFloppy ? FloppyProjectCard : ProjectCard;

  return (
    <section>
      {title && (
        <h2 className="font-mono text-sm text-accent mb-6">{title}</h2>
      )}
      <motion.div
        className={gridClass}
        variants={staggerContainer}
        initial={skipEntrance ? false : "hidden"}
        whileInView="show"
        viewport={inViewOnce}
      >
        {projects.map((project) => (
          // Anima o wrapper, não o <article> com viewTransitionName do card
          <motion.div
            key={project.id}
            variants={fadeUp}
            whileHover={
              isFloppy
                ? { y: -6, rotate: -1, transition: hoverSpring }
                : { y: -4, transition: hoverSpring }
            }
            whileTap={{ scale: 0.99 }}
          >
            <CardComponent project={project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
