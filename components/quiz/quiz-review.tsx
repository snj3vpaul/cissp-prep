"use client";

import { TRACK } from "@/lib/track";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Layers, RotateCcw, X } from "lucide-react";
import type { Flashcard, Question, QuizMode } from "@/lib/types";
import { DOMAINS, domainOfSub } from "@/lib/domains";
import { actions } from "@/lib/store";
import { scaledScore } from "@/lib/quiz";
import { subObjectiveBreakdown } from "@/lib/stats";
import { celebrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, DomainDot } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Rationale } from "@/components/quiz/rationale";
import { StudyReferences } from "@/components/quiz/study-references";
import { cn } from "@/lib/utils";
import { bandScaled, estimate, isPass, toScaled, verdict, type CatConfig, type Verdict } from "@/lib/cat";
import { ConfidenceGraph, DomainFeedback } from "@/components/exam/cat-results";
import { RaceClassification } from "@/components/race/race-classification";

export interface QuizResult {
  question: Question;
  chosen: number;
  correct: boolean;
  ms: number;
}

interface Props {
  results: QuizResult[];
  mode: QuizMode;
  exam?: boolean;
  totalPlanned: number;
  durationMs: number;
  /** CAT session: verdict from the ability estimate, confidence graph and domain feedback. */
  cat?: CatConfig;
  /** Linear exam scored by percentage of the full set. */
  passPct?: number;
  onRestart?: () => void;
}

const secs = (ms: number) => (ms < 60_000 ? `${Math.round(ms / 1000)}s` : `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`);

export function toFlashcard(q: Question): Flashcard {
  return {
    id: `missed-${q.id}`,
    domain: q.domain,
    front: q.stem,
    back: `${q.options[q.answerIndex]}\n\n${q.rationale}\n\nStudy: ${q.references.filter((r) => r.kind !== "outline").slice(0, 3).map((r) => r.title).join("; ")}`,
    mnemonic: q.mindsetHint,
    interval: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().slice(0, 10),
  };
}

export function QuizReview({ results, mode, exam, totalPlanned, durationMs, cat, passPct, onRestart }: Props) {
  const reduce = useReducedMotion();
  const correct = results.filter((r) => r.correct).length;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
  const items = useMemo(() => results.map((r) => ({ difficulty: r.question.difficulty, correct: r.correct, domain: r.question.domain })), [results]);
  const est = cat && results.length ? estimate(items) : null;
  const catVerdict = cat && est ? verdict(cat, results.length, est) : null;
  const band = est ? bandScaled(est) : null;
  const scaled = est ? toScaled(est.theta) : exam && !passPct ? scaledScore(items) : null;
  const examPct = passPct ? Math.round((correct / Math.max(1, totalPlanned)) * 100) : null; // unanswered count as wrong
  const passed = catVerdict ? isPass(catVerdict) : examPct !== null ? examPct >= (passPct ?? 80) : scaled !== null ? scaled >= 700 && results.length >= 100 : pct >= 70;
  const catTitle: Record<Verdict, string> = {
    pass: "Pass: confidently above the standard",
    fail: "Fail: confidently below the standard",
    "pass-at-max": "Pass at the maximum length",
    "fail-at-max": "Fail at the maximum length",
    incomplete: "Incomplete: fewer than the minimum items",
  };
  const missed = results.filter((r) => !r.correct);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "missed">("missed");
  const breakdown = useMemo(() => subObjectiveBreakdown(results.map((r) => ({ sub: r.question.subObjective, correct: r.correct }))), [results]);
  const avgMs = results.length ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0;
  const maxMs = Math.max(1, ...results.map((r) => r.ms));

  useEffect(() => {
    if (results.length && passed) celebrate("big");
  }, [results.length, passed]);

  const shown = filter === "missed" ? missed : results;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20 pt-4">
      <Card glow>
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <ProgressRing value={scaled !== null ? Math.round(scaled / 10) : (examPct ?? pct)} size={150} stroke={12} label={scaled !== null ? `Scaled score ${scaled} of 1000` : `Score ${examPct ?? pct}%`}>
            <div className="text-center">
              <p className="font-display text-3xl font-bold tabular-nums">{scaled !== null ? scaled : `${examPct ?? pct}%`}</p>
              <p className="text-[11px] text-muted-foreground">{scaled !== null ? "/ 1000 est." : `${correct}/${passPct ? totalPlanned : results.length}`}</p>
            </div>
          </ProgressRing>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{exam ? "Simulation complete" : "Session complete"}</p>
            <h1 className="mt-1 text-3xl font-bold">
              {catVerdict ? catTitle[catVerdict] : examPct !== null ? (passed ? `Pass: ${examPct}% (${passPct}% needed)` : `Not yet: ${examPct}% (${passPct}% needed)`) : exam ? (passed ? "Pass — mission accomplished 🎯" : results.length < 100 ? "Ended early" : "Not yet — keep training") : pct >= 85 ? "Outstanding" : pct >= 70 ? "Solid work" : "Good reps — review the misses"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {correct} of {results.length} correct{!cat && results.length < totalPlanned ? ` (${totalPlanned - results.length} not reached)` : ""} · {secs(durationMs)} total · {secs(avgMs)} avg per question
              {cat && band && ` · Ended after ${results.length} items (${cat.min}–${cat.max}). 95% range ${band.lo}–${band.hi}.`}
              {exam && !passPct && " · Passing line 700/1000. Scaled score is an estimate, not ISC2's psychometric model."}
              {passPct && ` · Unanswered questions count as wrong. Passing is ${passPct}%.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missed.length > 0 && (
                <Button
                  variant={sent ? "outline" : "default"}
                  disabled={sent}
                  onClick={() => {
                    actions.addCustomCards(missed.map((m) => toFlashcard(m.question)));
                    setSent(true);
                  }}
                >
                  <Layers /> {sent ? `Added ${missed.length} to Memory Gym` : `Send ${missed.length} missed to flashcards`}
                </Button>
              )}
              {onRestart && (
                <Button variant="outline" onClick={onRestart}>
                  <RotateCcw /> New set
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link href={mode === "exam" ? "/" : "/quiz"}>{mode === "exam" ? "Dashboard" : "Quiz modes"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <RaceClassification results={results} totalPlanned={totalPlanned} />

      {passPct && results.length > 0 && (
        <Card>
          <CardTitle>Results by domain</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Like the real results screen: how many questions each domain had and how many you got right.</p>
          <div className="mt-4">
            <DomainFeedback items={items} />
          </div>
        </Card>
      )}

      {cat && results.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardTitle>Confidence graph</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">How each answer moved the ability estimate. The test stops once the band clears the passing standard.</p>
            <div className="mt-3">
              <ConfidenceGraph items={items} />
            </div>
          </Card>
          <Card>
            <CardTitle>Domain feedback</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Right vs wrong per domain; bar length is how many items each domain received.</p>
            <div className="mt-4">
              <DomainFeedback items={items} />
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>By sub-objective</CardTitle>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Accuracy by sub-objective</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Objective</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="w-1/2 pb-2 font-medium">
                  <span className="sr-only">Bar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((b) => {
                const d = DOMAINS[domainOfSub(b.sub) - 1];
                return (
                  <tr key={b.sub} className="border-t border-border/50">
                    <td className="py-2 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <DomainDot color={d.color} /> {b.sub}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs tabular-nums">
                      {b.correct}/{b.total}
                    </td>
                    <td className="py-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", b.pct >= 70 ? "bg-emerald-500" : b.pct >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${Math.max(4, b.pct)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardTitle>Time per question</CardTitle>
          <p className="text-xs text-muted-foreground">Target on exam day ≈ {Math.round((TRACK.exam.minutes * 60) / TRACK.exam.items)}s per item ({TRACK.exam.minutes} min ÷ {TRACK.exam.items}).</p>
          <div className="mt-4 flex h-40 items-end gap-[2px]" role="img" aria-label={`Average ${secs(avgMs)} per question`}>
            {results.map((r, i) => (
              <div
                key={i}
                title={`Q${i + 1}: ${secs(r.ms)} — ${r.correct ? "correct" : "missed"}`}
                className={cn("min-w-[2px] flex-1 rounded-t-[3px]", r.correct ? "bg-emerald-500/80" : "bg-red-500/80")}
                style={{ height: `${Math.max(4, (r.ms / maxMs) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Correct
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-red-500" /> Missed
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Review answers</CardTitle>
          <div className="flex gap-1 rounded-full bg-muted p-1 text-xs" role="tablist">
            {(["missed", "all"] as const).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1.5 font-medium capitalize", filter === f ? "bg-background shadow" : "text-muted-foreground")}>
                {f === "missed" ? `Missed (${missed.length})` : `All (${results.length})`}
              </button>
            ))}
          </div>
        </div>
        <ol className="mt-4 space-y-2">
          {shown.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Nothing missed. Flawless. ✨</li>}
          {shown.map((r) => {
            const i = results.indexOf(r);
            const isOpen = open === r.question.id;
            return (
              <li key={r.question.id} className="rounded-2xl border border-border/70">
                <button className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.question.id)}>
                  <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", r.correct ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500")}>
                    {r.correct ? <Check className="h-3.5 w-3.5" aria-label="Correct" /> : <X className="h-3.5 w-3.5" aria-label="Missed" />}
                  </span>
                  <span className="flex-1 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">
                      Q{i + 1} · {r.question.subObjective} · {secs(r.ms)}
                    </span>
                    <span className="mt-1 block font-medium">{r.question.stem}</span>
                  </span>
                  <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} aria-hidden />
                </button>
                {isOpen && (
                  <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 px-4 pb-4">
                    <ul className="grid gap-1.5 text-sm">
                      {r.question.options.map((o, oi) => (
                        <li
                          key={oi}
                          className={cn(
                            "rounded-xl px-3 py-2",
                            oi === r.question.answerIndex ? "bg-emerald-500/10" : oi === r.chosen ? "bg-red-500/10" : "bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <span className="mr-2 font-mono text-xs font-bold">{"ABCD"[oi]}</span>
                          {o}
                          {oi === r.chosen && <span className="ml-2 text-xs font-medium">(your answer)</span>}
                        </li>
                      ))}
                    </ul>
                    <Rationale text={r.question.rationale} answerIndex={r.question.answerIndex} />
                    <StudyReferences refs={r.question.references} />
                  </motion.div>
                )}
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
