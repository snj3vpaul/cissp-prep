"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{sub}</p>}
    </Reveal>
  );
}
