"use client";

import { TRACK, TRACK_ID } from "@/lib/track";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, Sparkles } from "lucide-react";
import { MNEMONICS } from "@/data/mnemonics";
import { DOMAINS } from "@/lib/domains";
import { Chip, DomainDot } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Mindmap } from "@/components/mnemonics/mindmap";
import { cn } from "@/lib/utils";

function MnemonicCard({ m, i }: { m: (typeof MNEMONICS)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const d = DOMAINS[m.domain - 1];
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="list-none"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn("glass group h-full w-full rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/40", open && "glow-border")}
      >
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <DomainDot color={d.color} /> D{d.id} · {m.title}
        </span>
        <span className="mt-3 block font-display text-xl font-bold leading-tight">
          <span className="text-gradient">{m.hook}</span>
        </span>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <ol className="mt-4 space-y-1.5 text-sm">
                {m.expansion.map((e, k) => (
                  <motion.li
                    key={e}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: k * 0.05 }}
                    className="flex gap-2"
                  >
                    <span className="font-mono text-xs text-violet-500 dark:text-violet-300">{String(k + 1).padStart(2, "0")}</span>
                    {e}
                  </motion.li>
                ))}
              </ol>
              <p className="mt-4 flex gap-2 rounded-2xl bg-cyan-500/10 px-3 py-2 text-xs">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" aria-hidden />
                {m.why}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {!open && <span className="mt-3 block text-xs text-muted-foreground">Tap to expand</span>}
      </button>
    </motion.li>
  );
}

export function MnemonicVault() {
  const [domain, setDomain] = useState<number | null>(null);
  const list = domain ? MNEMONICS.filter((m) => m.domain === domain) : MNEMONICS;

  return (
    <div className="space-y-14 pb-20">
      <section aria-labelledby="hooks-heading">
        <h2 id="hooks-heading" className="sr-only">
          Memory hooks
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
          <Chip active={domain === null} onClick={() => setDomain(null)}>
            All ({MNEMONICS.length})
          </Chip>
          {DOMAINS.map((d) => (
            <Chip key={d.id} active={domain === d.id} onClick={() => setDomain(d.id)}>
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} aria-hidden />
              D{d.id}
            </Chip>
          ))}
        </div>
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((m, i) => (
              <MnemonicCard key={m.id} m={m} i={i} />
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <section aria-labelledby="maps-heading">
        <h2 id="maps-heading" className="text-2xl font-bold">
          Domain mindmaps
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">How each domain’s sub-objectives connect. Open any map fullscreen.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d) => (
            <li key={d.id}>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="glass group w-full overflow-hidden rounded-3xl p-3 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/25">
                    <div className="aspect-square rounded-2xl bg-muted/40 p-2">
                      <Mindmap domain={d.id} compact />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-3">
                      <span className="text-sm font-semibold leading-snug">
                        <span className="font-mono text-xs text-muted-foreground">D{d.id}</span> {d.name}
                      </span>
                      <Maximize2 className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent full title={`${TRACK.unit} ${d.id}: ${d.name}`} description={TRACK_ID === "cissp" ? `${d.weight}% of the exam · ${d.tagline}` : d.tagline}>
                  <div className="mx-auto aspect-square h-[calc(100%-4rem)] max-h-full max-w-full">
                    <Mindmap domain={d.id} />
                  </div>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
