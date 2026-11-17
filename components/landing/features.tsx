"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpenCheck, BrainCircuit, Gauge, Lock, Medal, Network, RotateCcw, Timer } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

function FlipDemo() {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? "Show term" : "Reveal definition"}
      className="group relative mx-auto block h-40 w-full max-w-[300px] [perspective:1000px]"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 grid place-items-center rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-600/30 to-indigo-900/40 p-4 [backface-visibility:hidden]">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-violet-200/70">Domain 3 · tap to flip</p>
            <p className="mt-2 font-display text-xl font-semibold text-white">Bell–LaPadula</p>
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 to-sky-900/40 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-center text-sm text-white">
            Confidentiality model.
            <br />
            <span className="font-semibold">No read up, no write down.</span>
            <br />
            <span className="text-xs text-cyan-100/80">Hook: “Bell rings for secrets”</span>
          </p>
        </div>
      </motion.div>
    </button>
  );
}

function SrsButtons() {
  return (
    <div className="mt-4 grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
      {[
        ["Again", "bg-red-500/15 text-red-400"],
        ["Hard", "bg-amber-500/15 text-amber-400"],
        ["Good", "bg-emerald-500/15 text-emerald-400"],
        ["Easy", "bg-cyan-500/15 text-cyan-400"],
      ].map(([l, c]) => (
        <span key={l} className={cn("rounded-lg py-1.5 text-center", c)}>
          {l}
        </span>
      ))}
    </div>
  );
}

const SMALL = [
  { icon: Timer, title: "CAT-style simulation", body: "125 items, 3-hour clock, strictly in order. No skipping, no going back — just like test day." },
  { icon: Network, title: "Mindmap vault", body: "Expandable domain mindmaps and classic memory hooks presented as animated cards." },
  { icon: Medal, title: "XP, badges & streaks", body: "Domain Conqueror, 7-Day Streak, Mock Exam Slayer. Momentum you can see." },
  { icon: Lock, title: "Local-first & private", body: "No sign-up. Progress stays in your browser. Export or import any time." },
];

export function Features() {
  return (
    <section className="relative py-20 sm:py-28" aria-labelledby="features-heading">
      <div className="container">
        <SectionHeading
          eyebrow="Your toolkit"
          title={<span id="features-heading">Everything you need. <span className="text-gradient">Nothing you don’t.</span></span>}
          sub="Built around the way the CISSP actually tests you: risk-based judgement, not trivia recall."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {/* Quiz engine — wide */}
          <Reveal className="lg:col-span-2">
            <div className="glass glow-border h-full rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
                  <BookOpenCheck className="h-5 w-5 text-violet-400" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">Quiz engine with manager-mindset rationales</h3>
              </div>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Quick 10, domain drills, timed sets. Every answer explains why the right option wins <em>and</em> why each distractor loses.
              </p>
              <div className="mt-6 rounded-2xl bg-muted/50 p-4 sm:p-5">
                <p className="font-mono text-[11px] text-muted-foreground">D1 · 1.10 Risk management · medium</p>
                <p className="mt-2 text-sm font-medium sm:text-[15px]">
                  A newly discovered vulnerability affects a revenue-critical system. What should the security manager do FIRST?
                </p>
                <ul className="mt-4 grid gap-2 text-sm">
                  {[
                    ["Apply the vendor patch immediately in production", false],
                    ["Assess the risk and inform the business owner", true],
                    ["Disconnect the system from the network", false],
                    ["Open a ticket for the next maintenance window", false],
                  ].map(([t, ok], i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                        ok ? "border-emerald-500/50 bg-emerald-500/10" : "border-border bg-background/40"
                      )}
                    >
                      <kbd className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-border font-mono text-[11px]">{i + 1}</kbd>
                      <span className={cn(ok && "font-medium")}>{t as string}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-xl border-l-2 border-cyan-400 bg-cyan-400/5 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Think like a manager:</span> understand the risk and involve the owner before acting. Patching blind or pulling the plug skips analysis.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Memory gym */}
          <Reveal delay={0.08}>
            <div className="glass h-full rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/15">
                  <BrainCircuit className="h-5 w-5 text-cyan-400" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">Memory Gym</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">3D flip cards, swipe on mobile, SM-2 spaced repetition. Anki-compatible export.</p>
              <div className="mt-6">
                <FlipDemo />
                <SrsButtons />
              </div>
            </div>
          </Reveal>

          {/* Readiness */}
          <Reveal>
            <div className="glass h-full rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15">
                  <Gauge className="h-5 w-5 text-emerald-400" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">Readiness score</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Weighted by domain, decayed over time. The dashboard tells you exactly what to study next and how many questions a day to hit your date.
              </p>
              <div className="mt-6 flex items-end gap-1.5" aria-hidden>
                {[40, 46, 44, 52, 58, 55, 63, 67, 66, 72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500/50 to-cyan-400/70" style={{ height: h * 1.3 }} />
                ))}
              </div>
            </div>
          </Reveal>

          {/* small grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {SMALL.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="glass group h-full rounded-3xl p-6 transition-colors hover:border-foreground/20">
                  <f.icon className="h-5 w-5 text-violet-400 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-6">
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Missed a question? Send it straight to your flashcard deck from the review screen.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
