"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame, Timer, Zap, Brain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { MeshBackground } from "@/components/landing/mesh-background";
import { DOMAINS } from "@/lib/domains";



// Sample readiness per domain for the preview radar
const SAMPLE = [78, 62, 71, 55, 84, 66, 73, 48];

function Radar({ values, size = 220 }: { values: number[]; size?: number }) {
  const cx = size / 2;
  const R = size / 2 - 26;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / values.length - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 100), cx + Math.sin(a) * R * (v / 100)];
  };
  const poly = values.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((lvl) => (
        <polygon key={lvl} points={values.map((_, i) => pt(i, lvl).join(",")).join(" ")} fill="none" stroke="currentColor" className="text-border" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, 100);
        const [lx, ly] = pt(i, 122);
        return (
          <g key={i}>
            <line x1={cx} y1={cx} x2={x} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-mono text-[10px]">
              D{i + 1}
            </text>
          </g>
        );
      })}
      <motion.polygon
        points={poly}
        fill="url(#radar-fill)"
        stroke="#A78BFA"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "50% 50%" }}
      />
      {values.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#22D3EE" />;
      })}
    </svg>
  );
}

function CommandPreview() {
  const weakest = SAMPLE.indexOf(Math.min(...SAMPLE));
  return (
    <div className="glass glow-border relative rounded-3xl p-4 shadow-2xl shadow-violet-900/20 sm:p-5">
      {/* window chrome */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">command center</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-muted/50 p-4">
          <ProgressRing value={72} size={112} stroke={9} label="Readiness 72%" />
          <span className="text-xs font-medium text-muted-foreground">Exam readiness</span>
        </div>
        <div className="rounded-2xl bg-muted/50 p-2">
          <div className="mx-auto aspect-square max-h-[190px]">
            <Radar values={SAMPLE} />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-muted/50 p-3">
          <Flame className="h-4 w-4 text-orange-400" aria-hidden />
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums">12</p>
          <p className="text-[11px] text-muted-foreground">day streak</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-3">
          <Timer className="h-4 w-4 text-cyan-400" aria-hidden />
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums">38</p>
          <p className="text-[11px] text-muted-foreground">days to exam</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-3">
          <Zap className="h-4 w-4 text-violet-400" aria-hidden />
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums">2,940</p>
          <p className="text-[11px] text-muted-foreground">XP earned</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-cyan-400/10 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/20">
          <Brain className="h-4 w-4 text-violet-500 dark:text-violet-300" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Study 10 minutes now</p>
          <p className="truncate text-[11px] text-muted-foreground">Weakest: D{weakest + 1} · {DOMAINS[weakest].name}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-cyan-500 dark:text-cyan-300" aria-hidden />
      </div>
    </div>
  );
}

export function Hero({ questionCount, cardCount }: { questionCount: number; cardCount: number }) {
  const STATS = [
    { value: String(questionCount), label: "original questions" },
    { value: String(cardCount), label: "SM-2 flashcards" },
    { value: "125", label: "item CAT simulation" },
    { value: "8/8", label: "ISC2 domains" },
  ];
  const reduce = useReducedMotion();
  const fade = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 sm:pt-20 lg:pb-28">
      <MeshBackground />
      <div className="container grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
        <div>
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
            Aligned to the ISC2 CISSP outline · April 2024
          </motion.div>

          <motion.h1 {...fade(0.08)} className="mt-6 text-balance text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-[68px]">
            Think like a manager.
            <br />
            <span className="text-gradient">Pass like a pro.</span>
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Your mission control for the CISSP. Adaptive-style practice, spaced-repetition flashcards and a full
            125-question, 3-hour exam simulation — free, private, and stored right in your browser.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start studying free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/exam">Take the 125-Q simulation</Link>
            </Button>
          </motion.div>

          <motion.dl {...fade(0.32)} className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{s.value}</dd>
                <dd className="text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1200 }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <CommandPreview />
          {/* floating chips */}
          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -left-6 -top-5 hidden rounded-2xl px-3 py-2 text-xs font-medium shadow-xl sm:block lg:-left-12"
          >
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" /> Correct · +15 XP
          </motion.div>
          <motion.div
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="glass absolute -bottom-6 right-6 hidden rounded-2xl px-3 py-2 text-xs font-medium shadow-xl sm:block"
          >
            🏅 Domain Conqueror unlocked
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
