"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Clock, ListOrdered, Lock, Shuffle, Target } from "lucide-react";
import { EXAM_FORMAT } from "@/lib/domains";
import { allocateByWeight } from "@/lib/quiz";
import { DOMAINS } from "@/lib/domains";
import { useAppState, useHydrated } from "@/lib/store";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { Card, DomainDot } from "@/components/ui/card";
import { QUESTIONS } from "@/data/questions";

export function ExamSim() {
  const [started, setStarted] = useState(false);
  const [run, setRun] = useState(0);
  const [ack, setAck] = useState(false);
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const { sessions } = useAppState();
  const items = Math.min(EXAM_FORMAT.simulationItems, QUESTIONS.length);
  const alloc = allocateByWeight(items);
  const past = sessions.filter((s) => s.mode === "exam").slice(-3).reverse();

  if (started) {
    return (
      <QuizRunner
        key={run}
        mode="exam"
        title="CAT simulation"
        exam
        examItems={items}
        timeLimitSec={EXAM_FORMAT.minutes * 60}
        onRestart={() => setRun((r) => r + 1)}
      />
    );
  }

  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-4 pb-20">
      <Card glow>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">Full exam simulation</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">125 items. 3 hours. No going back.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          This simulation mirrors the CISSP’s Computerized Adaptive Testing constraints: items appear one at a time, in order, and difficulty
          adapts to your performance. Explanations stay hidden until the review screen.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: ListOrdered, k: "Items", v: `${items}` },
            { icon: Clock, k: "Time limit", v: "3:00:00" },
            { icon: Target, k: "Passing", v: "700 / 1000" },
            { icon: Shuffle, k: "Format", v: "Adaptive" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-muted/50 p-4">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <x.icon className="h-3.5 w-3.5" aria-hidden /> {x.k}
              </dt>
              <dd className="mt-1 font-display text-xl font-bold">{x.v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display font-semibold">Rules of engagement</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" aria-hidden /> Once you submit an answer, it’s locked. You can’t skip, flag or revisit items.
            </li>
            <li className="flex gap-2">
              <Shuffle className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" aria-hidden /> Correct answers raise the difficulty of upcoming items; misses lower it.
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" aria-hidden /> When the clock hits zero the exam ends and is scored on what you answered.
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden /> The real exam ranges from {EXAM_FORMAT.minItems}–{EXAM_FORMAT.maxItems} items and can stop early once
              ISC2’s model is confident. Our scaled score is an estimate for practice.
            </li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display font-semibold">Content blueprint</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {DOMAINS.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <DomainDot color={d.color} />
                <span className="flex-1 truncate text-muted-foreground">
                  D{d.id} {d.name}
                </span>
                <span className="font-mono text-xs tabular-nums">{alloc[d.id]} items</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {hydrated && past.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold">Recent simulations</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {past.map((s) => (
              <li key={s.id} className="rounded-2xl bg-muted/50 p-3 text-sm">
                <p className="font-display text-xl font-bold tabular-nums">{s.scaled}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.ts).toLocaleDateString()} · {s.correct}/{s.total} · {s.passed ? "Pass" : "Below line"}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-5 w-5 accent-violet-500" />
          <span>I’m ready for a 3-hour block without interruptions. Leaving the page will end my attempt.</span>
        </label>
        <Button size="lg" disabled={!ack} onClick={() => setStarted(true)} className="w-full sm:w-auto">
          Begin simulation
        </Button>
      </Card>
    </motion.div>
  );
}
