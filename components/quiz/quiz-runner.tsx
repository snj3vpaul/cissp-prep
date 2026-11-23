"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Flag, Lightbulb, Lock, X } from "lucide-react";
import type { Question, QuizMode } from "@/lib/types";
import { DOMAINS, type DomainId } from "@/lib/domains";
import { actions, useAppState } from "@/lib/store";
import { nextExamQuestion, planExam, scaledScore } from "@/lib/quiz";
import { haptic, playSound } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { DomainDot } from "@/components/ui/card";
import { Rationale } from "@/components/quiz/rationale";
import { StudyReferences } from "@/components/quiz/study-references";
import { QuizReview, type QuizResult } from "@/components/quiz/quiz-review";
import { cn } from "@/lib/utils";

interface Props {
  mode: QuizMode;
  title: string;
  domain?: DomainId;
  /** Fixed question set for practice modes. Omit for the adaptive exam. */
  questions?: Question[];
  /** Exam mode: adaptive selection, no explanations until the end, no backtracking. */
  exam?: boolean;
  examItems?: number;
  timeLimitSec?: number;
  /** Knowledge-check effort level, recorded with the session. */
  level?: number;
  onRestart?: () => void;
}

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export function QuizRunner({ mode, title, domain, questions, exam = false, examItems = 125, timeLimitSec, level, onRestart }: Props) {
  const { settings } = useAppState();
  const reduce = useReducedMotion();
  const plan = useMemo(() => (exam ? planExam(examItems) : null), [exam, examItems]);

  const [served, setServed] = useState<Question[]>(() => {
    if (exam && plan) {
      const first = nextExamQuestion(plan, [], []);
      return first ? [first] : [];
    }
    return questions ?? [];
  });
  const total = exam ? examItems : served.length;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const finished = finishedAt !== null;
  const [startedAt] = useState(() => Date.now());
  const [remaining, setRemaining] = useState(timeLimitSec ?? 0);
  const [showHint, setShowHint] = useState(false);
  const qStart = useRef(0);
  const finishedRef = useRef(false);
  const onTimeUp = useRef<() => void>(() => {});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const q = served[idx];

  // Start the per-question stopwatch whenever a new question is shown.
  useEffect(() => {
    qStart.current = Date.now();
  }, [idx]);

  function finish(res: QuizResult[]) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const now = Date.now();
    setFinishedAt(now);
    const correct = res.filter((r) => r.correct).length;
    const scaled = exam ? scaledScore(res.map((r) => ({ difficulty: r.question.difficulty, correct: r.correct }))) : undefined;
    if (res.length) {
      actions.recordSession({
        id: `${now}`,
        mode,
        domain,
        total: res.length,
        correct,
        ms: now - startedAt,
        ts: now,
        scaled,
        passed: exam ? (scaled ?? 0) >= 700 && res.length >= 100 : undefined,
        level,
      });
    }
  }

  // Keep the timer's callback pointing at the latest results.
  useEffect(() => {
    onTimeUp.current = () => finish(results);
  });

  // Countdown against a fixed deadline (no drift if the tab is throttled).
  useEffect(() => {
    if (!timeLimitSec || finished) return;
    const deadline = startedAt + timeLimitSec * 1000;
    const t = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(t);
        onTimeUp.current();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [timeLimitSec, finished, startedAt]);

  // warn before leaving an exam in progress
  useEffect(() => {
    if (!exam || finished) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [exam, finished]);

  function advance(res: QuizResult[] = results) {
    if (res.length >= total) return finish(res);
    if (exam && plan) {
      const nq = nextExamQuestion(
        plan,
        res.map((r) => r.question),
        res.map((r) => r.correct)
      );
      if (!nq) return finish(res);
      setServed((s) => [...s, nq]);
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function submit() {
    if (selected === null || submitted || !q) return;
    const correct = selected === q.answerIndex;
    const ms = Date.now() - qStart.current;
    const r: QuizResult = { question: q, chosen: selected, correct, ms };
    const next = [...results, r];
    setResults(next);
    actions.recordAttempt({ qid: q.id, domain: q.domain, sub: q.subObjective, difficulty: q.difficulty, correct, ms, ts: Date.now(), mode });
    haptic(settings.haptics, correct ? 12 : [20, 40, 20]);

    if (exam) {
      // No feedback in exam mode: lock and advance immediately.
      advance(next);
    } else {
      playSound(settings.sound, correct ? "correct" : "wrong");
      setSubmitted(true);
    }
  }

  // keyboard shortcuts
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!submitted && ["1", "2", "3", "4"].includes(e.key)) {
        setSelected(Number(e.key) - 1);
        e.preventDefault();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!submitted) submit();
        else advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (finished) {
    return (
      <QuizReview
        results={results}
        mode={mode}
        exam={exam}
        totalPlanned={total}
        durationMs={(finishedAt ?? startedAt) - startedAt}
        onRestart={onRestart}
      />
    );
  }

  if (!q) {
    return <p className="py-20 text-center text-muted-foreground">No questions available for this selection yet.</p>;
  }

  const d = DOMAINS[q.domain - 1];
  const progress = (results.length / total) * 100;
  const lowTime = timeLimitSec && remaining < Math.min(300, timeLimitSec * 0.1);

  return (
    <div className="mx-auto max-w-3xl pb-20">
      {/* top bar */}
      <div className="sticky top-14 z-20 lg:top-0 -mx-5 bg-background/80 px-5 pb-3 pt-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:px-0">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-muted-foreground">
            {title} · {exam ? "Item" : "Question"} {idx + 1} of {total}
          </span>
          <div className="flex items-center gap-2">
            {timeLimitSec ? (
              <span
                role="timer"
                aria-live={lowTime ? "assertive" : "off"}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono tabular-nums", lowTime ? "bg-red-500/15 text-red-500" : "bg-muted")}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden /> {fmt(remaining)}
              </span>
            ) : null}
            {exam && (
              <span className="hidden items-center gap-1 text-muted-foreground sm:inline-flex">
                <Lock className="h-3.5 w-3.5" aria-hidden /> No going back
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!exam || window.confirm("End the simulation now? Your score will be based on the items you've answered.")) finish(results);
              }}
            >
              <Flag /> End
            </Button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={results.length} aria-valuemin={0} aria-valuemax={total} aria-label="Quiz progress">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 80, damping: 20 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={q.id + idx}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4"
          aria-labelledby="q-stem"
        >
          {!exam && (
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <DomainDot color={d.color} /> D{d.id} · {d.short} · {q.subObjective}
              <span className="rounded-full border border-border px-2 py-0.5 capitalize">{q.difficulty}</span>
            </p>
          )}
          <h1 id="q-stem" ref={headingRef} tabIndex={-1} className="mt-3 font-sans text-lg font-semibold leading-relaxed tracking-normal outline-none sm:text-xl">
            {q.stem}
          </h1>

          <div role="radiogroup" aria-labelledby="q-stem" className="mt-6 grid gap-3">
            {q.options.map((opt, i) => {
              const isSel = selected === i;
              const isAns = q.answerIndex === i;
              const state = submitted ? (isAns ? "correct" : isSel ? "wrong" : "idle") : isSel ? "selected" : "idle";
              return (
                <motion.button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  whileTap={reduce || submitted ? undefined : { scale: 0.985 }}
                  className={cn(
                    "group flex min-h-[56px] w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all duration-200",
                    state === "idle" && "border-border bg-card/50 hover:border-foreground/25 hover:bg-accent/40",
                    state === "selected" && "border-violet-500/70 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.4)]",
                    state === "correct" && "border-emerald-500/60 bg-emerald-500/10",
                    state === "wrong" && "border-red-500/60 bg-red-500/10",
                    submitted && state === "idle" && "opacity-60"
                  )}
                >
                  <kbd
                    className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-xs",
                      state === "selected" ? "border-violet-500 bg-violet-500 text-white" : "border-border"
                    )}
                    aria-hidden
                  >
                    {state === "correct" ? <Check className="h-4 w-4 text-emerald-500" /> : state === "wrong" ? <X className="h-4 w-4 text-red-500" /> : "ABCD"[i]}
                  </kbd>
                  <span className="flex-1">{opt}</span>
                  <span className="sr-only">{state === "correct" ? "(correct answer)" : state === "wrong" ? "(your answer, incorrect)" : ""}</span>
                </motion.button>
              );
            })}
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Keys: <kbd className="rounded border border-border px-1 font-mono">1</kbd>–<kbd className="rounded border border-border px-1 font-mono">4</kbd> select ·{" "}
              <kbd className="rounded border border-border px-1 font-mono">Enter</kbd> {submitted ? "next" : "submit"}
            </p>
            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto [&>button:last-child]:flex-1 sm:[&>button:last-child]:flex-none">
              {!exam && !submitted && q.mindsetHint && (
                <Button variant="ghost" onClick={() => setShowHint((s) => !s)} aria-expanded={showHint}>
                  <Lightbulb /> Hint
                </Button>
              )}
              {!submitted ? (
                <Button onClick={submit} disabled={selected === null} size="lg">
                  {exam ? (idx + 1 >= total ? "Submit & finish" : "Submit & next") : "Submit"}
                </Button>
              ) : (
                <Button onClick={() => advance()} size="lg" autoFocus>
                  {results.length >= total ? "See results" : "Next question"}
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showHint && !submitted && q.mindsetHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden rounded-2xl border-l-2 border-cyan-400 bg-cyan-400/5 px-4 py-3 text-sm"
              >
                <span className="font-semibold">Think like a manager: </span>
                {q.mindsetHint}
              </motion.p>
            )}
          </AnimatePresence>

          {/* explanation panel (practice only) */}
          <AnimatePresence>
            {submitted && !exam && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass mt-6 rounded-3xl p-5"
                aria-live="polite"
              >
                <p className={cn("flex items-center gap-2 font-display text-lg font-semibold", selected === q.answerIndex ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                  {selected === q.answerIndex ? <Check className="h-5 w-5" aria-hidden /> : <X className="h-5 w-5" aria-hidden />}
                  {selected === q.answerIndex ? "Correct" : `Not quite — the answer is ${"ABCD"[q.answerIndex]}`}
                </p>
                <Rationale text={q.rationale} answerIndex={q.answerIndex} className="mt-4" />
                {q.mindsetHint && (
                  <p className="mt-4 rounded-xl border-l-2 border-cyan-400 bg-cyan-400/5 px-3 py-2 text-sm">
                    <span className="font-semibold">Mindset: </span>
                    {q.mindsetHint}
                  </p>
                )}
                <StudyReferences refs={q.references} className="mt-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
