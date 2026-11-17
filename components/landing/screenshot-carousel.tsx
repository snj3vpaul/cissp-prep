"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Flag, Lock, Trophy } from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/landing/reveal";

function Frame({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="glass glow-border overflow-hidden rounded-3xl shadow-2xl shadow-violet-950/30">
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <span className="mx-auto rounded-md bg-muted/70 px-3 py-0.5 font-mono text-[11px] text-muted-foreground">{url}</span>
        <span className="w-10" />
      </div>
      <div className="min-h-[340px] p-4 sm:p-6">{children}</div>
    </div>
  );
}

function DashboardShot() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-muted/50 p-4 md:col-span-2">
        <p className="text-sm text-muted-foreground">Good evening, analyst 👋</p>
        <p className="mt-1 font-display text-2xl font-bold">You’re 72% exam-ready</p>
        <div className="mt-5 space-y-2.5">
          {DOMAINS.map((d, i) => {
            const v = [78, 62, 71, 55, 84, 66, 73, 48][i];
            return (
              <div key={d.id} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 truncate text-muted-foreground">{d.short}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background/60">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: d.color }} />
                </div>
                <span className="w-8 text-right font-mono tabular-nums">{v}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/10 p-4">
          <p className="text-3xl">🔥</p>
          <p className="mt-1 font-display text-2xl font-bold">12 days</p>
          <p className="text-xs text-muted-foreground">study streak</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Exam day · Dec 25</p>
          <p className="mt-1 font-display text-2xl font-bold">38 days</p>
          <p className="text-xs text-cyan-500 dark:text-cyan-300">Pace: 24 questions / day</p>
        </div>
      </div>
    </div>
  );
}

function ExamShot() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-mono text-muted-foreground">Item 47 of 125</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1 font-mono tabular-nums">
          <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden /> 01:52:08
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden /> No going back
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[37.6%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
      </div>
      <p className="mt-6 text-[15px] font-medium leading-relaxed">
        An organization is moving its HR platform to a SaaS provider. Which document BEST defines the provider’s security obligations?
      </p>
      <ul className="mt-5 grid gap-2.5 text-sm">
        {["Service level agreement", "Memorandum of understanding", "Contract with right-to-audit clause", "Provider’s SOC 2 Type I report"].map((t, i) => (
          <li key={t} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", i === 2 ? "border-violet-500/60 bg-violet-500/10" : "border-border bg-background/40")}>
            <kbd className="grid h-6 w-6 place-items-center rounded-md border border-border font-mono text-[11px]">{i + 1}</kbd>
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-end">
        <span className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white">Submit ↵</span>
      </div>
    </div>
  );
}

function FlashShot() {
  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_1.2fr]">
      <div className="relative mx-auto h-56 w-full max-w-[320px]">
        <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-2xl bg-muted/60" />
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-1 rounded-2xl bg-muted/80" />
        <div className="absolute inset-0 grid place-items-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 to-violet-700/30 p-6 text-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Domain 7</p>
            <p className="mt-2 font-display text-xl font-semibold">RPO vs RTO</p>
            <p className="mt-3 text-sm text-muted-foreground">RPO = how much data you can lose. RTO = how long you can be down.</p>
          </div>
        </div>
      </div>
      <div>
        <p className="font-display text-xl font-semibold">Due today: 42 cards</p>
        <p className="mt-1 text-sm text-muted-foreground">SM-2 schedules each card right before you forget it.</p>
        <div className="mt-5 grid grid-cols-4 gap-2 text-xs font-semibold">
          {[
            ["Again", "<1m", "bg-red-500/15 text-red-500 dark:text-red-400"],
            ["Hard", "2d", "bg-amber-500/15 text-amber-600 dark:text-amber-400"],
            ["Good", "4d", "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"],
            ["Easy", "9d", "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"],
          ].map(([l, t, c]) => (
            <div key={l} className={cn("rounded-xl py-2.5 text-center", c)}>
              {l}
              <span className="block font-mono text-[10px] font-normal opacity-70">{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {["All domains", "Shuffle", "Cram mode", "Export CSV"].map((c) => (
            <span key={c} className="rounded-full border border-border px-3 py-1 text-muted-foreground">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressShot() {
  const pts = [48, 52, 50, 57, 61, 59, 66, 64, 70, 73, 71, 76];
  const w = 520, h = 150;
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - (p - 40) * 3.4}`).join(" ");
  return (
    <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl bg-muted/50 p-4">
        <p className="text-sm font-semibold">Accuracy over time</p>
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-40 w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="acc-f" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".45" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#acc-f)" />
          <path d={path} fill="none" stroke="#22D3EE" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-4 grid grid-cols-[repeat(21,minmax(0,1fr))] gap-1" aria-hidden>
          {Array.from({ length: 63 }).map((_, i) => {
            const v = (i * 37) % 5;
            return <span key={i} className="aspect-square rounded-[3px]" style={{ background: v === 0 ? "hsl(var(--muted))" : `rgba(139,92,246,${0.2 + v * 0.18})` }} />;
          })}
        </div>
      </div>
      <div className="grid content-start gap-3">
        {[["Domain Conqueror", "90%+ on a full domain drill", Trophy], ["7-Day Streak", "Studied 7 days in a row", Flag], ["Mock Exam Slayer", "Passed a 125-Q simulation", Clock]].map(([t, d, Icon]) => {
          const I = Icon as typeof Trophy;
          return (
            <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400/30 to-violet-500/30">
                <I className="h-5 w-5 text-amber-300" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{t as string}</p>
                <p className="text-xs text-muted-foreground">{d as string}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SLIDES = [
  { key: "dashboard", label: "Dashboard", url: "/dashboard", node: <DashboardShot /> },
  { key: "exam", label: "Exam simulation", url: "/exam", node: <ExamShot /> },
  { key: "flash", label: "Memory Gym", url: "/flashcards", node: <FlashShot /> },
  { key: "progress", label: "Progress", url: "/progress", node: <ProgressShot /> },
];

export function ScreenshotCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [paused, reduce]);

  const go = (d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="py-20 sm:py-28" aria-labelledby="tour-heading" aria-roledescription="carousel">
      <div className="container">
        <SectionHeading eyebrow="Take the tour" title={<span id="tour-heading">A cockpit for every phase of prep</span>} />

        <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Screens">
          {SLIDES.map((s, idx) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={i === idx}
              aria-controls={`slide-${s.key}`}
              onClick={() => setI(idx)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                i === idx ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {i === idx && <motion.span layoutId="tour-pill" className="glass absolute inset-0 -z-10 rounded-full" />}
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative mx-auto mt-8 max-w-5xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={SLIDES[i].key}
              id={`slide-${SLIDES[i].key}`}
              role="tabpanel"
              aria-label={`${SLIDES[i].label} preview`}
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Frame url={`cissp-command-center.app${SLIDES[i].url}`}>{SLIDES[i].node}</Frame>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} className="glass grid h-10 w-10 place-items-center rounded-full" aria-label="Previous screen">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5" aria-hidden>
              {SLIDES.map((s, idx) => (
                <span key={s.key} className={cn("h-1.5 rounded-full transition-all duration-300", i === idx ? "w-6 bg-gradient-to-r from-violet-500 to-cyan-400" : "w-1.5 bg-muted-foreground/30")} />
              ))}
            </div>
            <button onClick={() => go(1)} className="glass grid h-10 w-10 place-items-center rounded-full" aria-label="Next screen">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
