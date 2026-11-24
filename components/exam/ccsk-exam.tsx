"use client";

import { useState } from "react";
import { BookOpen, Clock, ListOrdered, Lock, Target } from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS_BY_DOMAIN } from "@/data/questions";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { allocateByWeight, prioritize, shuffle } from "@/lib/quiz";
import { TRACK } from "@/lib/track";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { Card, DomainDot } from "@/components/ui/card";

/** Linear CCSK-style exam: fixed set spread evenly across the 12 domains, scored by percentage. */
function buildSet() {
  const { attempts } = actions.exportState();
  const alloc = allocateByWeight(TRACK.exam.items);
  return shuffle(DOMAINS.flatMap((d) => prioritize(QUESTIONS_BY_DOMAIN[d.id] ?? [], attempts).slice(0, alloc[d.id])));
}

export function CcskExam() {
  const [started, setStarted] = useState(false);
  const [run, setRun] = useState(0);
  const [ack, setAck] = useState(false);
  const [set, setSet] = useState<ReturnType<typeof buildSet>>([]);
  const hydrated = useHydrated();
  const { sessions } = useAppState();
  const { items, minutes, passPct } = TRACK.exam;
  const past = sessions.filter((s) => s.mode === "exam").slice(-3).reverse();

  if (started) {
    return (
      <QuizRunner
        key={run}
        mode="exam"
        title="CCSK exam simulation"
        exam
        questions={set}
        passPct={passPct}
        timeLimitSec={minutes * 60}
        onRestart={() => {
          setSet(buildSet());
          setRun((r) => r + 1);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20">
      <Card>
        <p className="text-xs font-medium text-muted-foreground">CCSK v5 exam simulation</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {items} questions. {minutes} minutes. {passPct}% to pass.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Mirrors the real CCSK v5 exam from the Cloud Security Alliance: multiple choice, drawn across all 12 domains, open book, and it can’t be paused. Results show how many questions each domain had and how many you got right.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: ListOrdered, k: "Questions", v: String(items) },
            { icon: Clock, k: "Time limit", v: `${minutes} min` },
            { icon: Target, k: "Passing", v: `${passPct}%` },
            { icon: BookOpen, k: "Format", v: "Open book" },
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
          <h2 className="font-display font-semibold">How to use it</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Keep the official CCSK v5 Study Guide open, as you will on exam day. About two minutes per question leaves little time for searching, so know where things are.
            </li>
            <li className="flex gap-2">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Answers lock on submit and there are no explanations until the end.
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Unanswered questions count as wrong when time runs out.
            </li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display font-semibold">Domains</h2>
          <p className="mt-1 text-xs text-muted-foreground">CSA doesn’t publish domain weights, so questions are spread evenly ({Math.round(items / DOMAINS.length)} per domain).</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {DOMAINS.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <DomainDot color={d.color} />
                <span className="flex-1 truncate text-muted-foreground">
                  D{d.id} {d.name}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {hydrated && past.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold">Recent attempts</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {past.map((s) => (
              <li key={s.id} className="rounded-2xl bg-muted/50 p-3 text-sm">
                <p className="font-display text-xl font-bold tabular-nums">{Math.round((s.correct / Math.max(1, s.total)) * 100)}%</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.ts).toLocaleDateString()} · {s.correct}/{s.total} · {s.passed ? "Pass" : "Not yet"}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-5 w-5 accent-foreground" />
          <span>I’m ready for {minutes} minutes without interruptions. Leaving the page ends the attempt.</span>
        </label>
        <Button
          size="lg"
          disabled={!ack}
          onClick={() => {
            setSet(buildSet());
            setStarted(true);
          }}
          className="w-full sm:w-auto"
        >
          Begin CCSK simulation
        </Button>
      </Card>
    </div>
  );
}
