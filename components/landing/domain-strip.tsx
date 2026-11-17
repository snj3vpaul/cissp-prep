"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DOMAINS } from "@/lib/domains";
import { Reveal, SectionHeading } from "@/components/landing/reveal";

export function DomainStrip() {
  const reduce = useReducedMotion();
  return (
    <section className="py-20 sm:py-28" aria-labelledby="domains-heading">
      <div className="container">
        <SectionHeading
          eyebrow="Exam blueprint"
          title={<span id="domains-heading">All 8 domains, weighted like the real thing</span>}
          sub="Practice volume and readiness scoring follow the official ISC2 domain weights, so your study time goes where the points are."
        />
        <Reveal delay={0.1} className="mt-12">
          {/* stacked weight bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full" role="img" aria-label="Domain weight distribution">
            {DOMAINS.map((d, i) => (
              <motion.div
                key={d.id}
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${d.weight}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: d.color }}
                className="h-full first:rounded-l-full last:rounded-r-full"
              />
            ))}
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINS.map((d) => (
              <li key={d.id} className="glass group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">DOMAIN {d.id}</span>
                  <span className="rounded-full px-2 py-0.5 font-mono text-xs font-semibold" style={{ background: `${d.color}22`, color: d.color }}>
                    {d.weight}%
                  </span>
                </div>
                <p className="mt-2 font-display text-[15px] font-semibold leading-snug">{d.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.tagline}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
