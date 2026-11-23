"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { buildCheckSet, CHECK_LEVELS, clampLevel, recommendedLevel } from "@/lib/knowledge-check";
import { domainStats, overallReadiness, daysUntil } from "@/lib/stats";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { EffortSlider } from "@/components/knowledge/effort-slider";
import { Skeleton } from "@/components/ui/card";

function Run({ level, onRestart }: { level: number; onRestart: () => void }) {
  const [set] = useState(() => buildCheckSet(level, actions.exportState().attempts));
  const L = CHECK_LEVELS[level];
  return <QuizRunner mode="check" title={`Knowledge check · ${L.name}`} questions={set} timeLimitSec={L.time} level={level} onRestart={onRestart} />;
}

/** /quiz/check — the effort picker, or a running check when ?level= is set. */
export function KnowledgeCheck() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const state = useAppState();
  const [run, setRun] = useState(0);
  const recommended = useMemo(
    () => recommendedLevel(overallReadiness(domainStats(state.attempts)), daysUntil(state.settings.examDate)),
    [state.attempts, state.settings.examDate]
  );

  if (!hydrated) return <Skeleton className="mx-auto mt-10 h-72 max-w-xl" />;

  const raw = params.get("level");
  if (raw !== null) return <Run key={run} level={clampLevel(raw)} onRestart={() => setRun((r) => r + 1)} />;

  return (
    <div className="mx-auto max-w-xl pt-6 sm:pt-14">
      <h1 className="text-2xl font-bold sm:text-3xl">Knowledge check</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick how hard to push. Low is a five-question fact recall; Galaxy is 60 hard-first items on an exam-pace clock. Questions you haven’t seen or got wrong come first.
      </p>
      <div className="mt-6">
        <EffortSlider recommended={recommended} />
      </div>
    </div>
  );
}
