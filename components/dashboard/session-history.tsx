"use client";

import { Brain, ListChecks, RotateCcw, Swords, Target, Timer } from "lucide-react";
import type { AppState, SessionSummary } from "@/lib/types";
import { sessionKind, sessionTitle, sessionXp } from "@/lib/derived";

const ICON = { quick: ListChecks, timed: Timer, missed: RotateCcw, domain: Target, exam: Swords, check: Brain } as const;

function dayLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Session history grouped by day, like a transaction list: score on the right, XP earned below it. */
export function SessionHistory({ state, sessions, limit = 12 }: { state: AppState; sessions: SessionSummary[]; limit?: number }) {
  const list = sessions.slice(0, limit);
  if (!list.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No sessions yet. Finished quizzes and checks will show up here.</p>;
  }
  const groups: { label: string; items: SessionSummary[] }[] = [];
  for (const s of list) {
    const label = dayLabel(s.ts);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(s);
    else groups.push({ label, items: [s] });
  }
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.label}>
          <h3 className="text-[15px] font-semibold">{g.label}</h3>
          <ul className="mt-1">
            {g.items.map((s) => {
              const Icon = ICON[s.mode];
              return (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{sessionTitle(s)}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{sessionKind(s)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-semibold tabular-nums">
                      {s.mode === "exam" && s.scaled !== undefined ? s.scaled : `${s.correct}/${s.total}`}
                    </p>
                    <p className="text-[13px] font-medium tabular-nums text-sky-600 dark:text-sky-400">+{sessionXp(state, s)} XP</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
