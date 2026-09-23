import type { Project } from "@blog/shared";
import { motion } from "motion/react";
import {
  fadeUp,
  hoverSpring,
  inViewOnce,
  staggerContainer,
  useSkipEntrance,
} from "@/lib/motion";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  title?: string;
  columns?: 2 | 3;
}

export function ProjectGrid({ projects, title, columns = 2 }: ProjectGridProps) {
  const skipEntrance = useSkipEntrance();

  if (projects.length === 0) {
    return (
      <p className="font-mono text-sm text-text-muted">
        // nenhum projeto encontrado
      </p>
    );
  }

  const gridClass =
    columns === 3
      ? "grid gap-4 md:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2";

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
            whileHover={{ y: -4, transition: hoverSpring }}
            whileTap={{ scale: 0.99 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
