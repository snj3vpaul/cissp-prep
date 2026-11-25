"use client";

import { TRACK } from "@/lib/track";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Question, QuizMode } from "@/lib/types";
import { getDomainBySlug } from "@/lib/domains";
import { actions, useHydrated } from "@/lib/store";
import { buildDomainSet, buildMissedSet, buildWeightedSet } from "@/lib/quiz";
import { SPECIAL_MODES } from "@/lib/quiz-modes";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function buildSet(slug: string, n: number): Question[] {
  // Client-only: uses saved history + randomness.
  const attempts = actions.exportState().attempts;
  const domain = getDomainBySlug(slug);
  if (slug === "missed") return buildMissedSet(attempts, n);
  if (slug in SPECIAL_MODES) return buildWeightedSet(n, attempts);
  if (domain) return buildDomainSet(domain.id, n, attempts);
  return [];
}

/** One run of a quiz; remounted (via key) for "New set", so the set is built once in a lazy initializer. */
function QuizRun({ slug, n, onRestart }: { slug: string; n: number; onRestart: () => void }) {
  const [set] = useState(() => buildSet(slug, n));
  const special = SPECIAL_MODES[slug as keyof typeof SPECIAL_MODES];
  const domain = getDomainBySlug(slug);

  if (!set.length) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-4xl">🎯</p>
        <h1 className="mt-4 text-2xl font-bold">{slug === "missed" ? "No missed questions yet" : "No questions found"}</h1>
        <p className="mt-2 text-muted-foreground">{slug === "missed" ? "Answer some questions first — anything you miss will show up here." : "Try another mode."}</p>
        <Button asChild className="mt-6">
          <Link href="/quiz/quick">Start a Quick 10</Link>
        </Button>
      </div>
    );
  }

  const mode: QuizMode = special ? (slug as QuizMode) : "domain";
  const title = special ? special.title : `${TRACK.unit[0]}${domain!.id} ${domain!.short}`;
  return <QuizRunner mode={mode} title={title} domain={domain?.id} questions={set} timeLimitSec={special?.time} onRestart={onRestart} />;
}

export function QuizSession({ slug }: { slug: string }) {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [run, setRun] = useState(0);
  const special = SPECIAL_MODES[slug as keyof typeof SPECIAL_MODES];
  const n = Math.min(60, Math.max(5, Number(params.get("n")) || (special?.n ?? 15)));

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pt-8" aria-busy="true">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-20" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  return <QuizRun key={run} slug={slug} n={n} onRestart={() => setRun((r) => r + 1)} />;
}
