import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, useSkipEntrance } from "@/lib/motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const skipEntrance = useSkipEntrance();

  return (
    <motion.div
      className={className}
      initial={skipEntrance ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.65, ease: EASE_OUT, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
