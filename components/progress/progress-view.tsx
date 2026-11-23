"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Copy, Lock } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { accuracyTimeline, domainStats, overallReadiness } from "@/lib/stats";
import { computeStreak } from "@/lib/streak";
import { BADGES } from "@/lib/badges";
import { levelFromXp } from "@/lib/level";
import { DOMAINS } from "@/lib/domains";
import { Card, CardTitle, DomainDot, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccuracyChart } from "@/components/progress/accuracy-chart";
import { HeatCalendar } from "@/components/progress/heat-calendar";
import { cn } from "@/lib/utils";

const MODE_LABEL: Record<string, string> = { quick: "Quick 10", domain: "Domain drill", timed: "Timed 25", exam: "Exam sim", missed: "Missed review" };

export function ProgressView() {
  const state = useAppState();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => domainStats(state.attempts), [state.attempts]);
  const timeline = useMemo(() => accuracyTimeline(state.attempts, 30), [state.attempts]);
  const streak = computeStreak(state.studyDays);
  const lvl = levelFromXp(state.xp);
  const readiness = overallReadiness(stats);

  if (!hydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
        <Skeleton className="h-40" />
        <Skeleton className="h-40 md:col-span-2" />
        <Skeleton className="h-72 md:col-span-3" />
      </div>
    );
  }

  const profile = {
    app: "CISSP Command Center",
    level: lvl.level,
    rank: lvl.rank,
    xp: state.xp,
    readiness,
    answered: state.attempts.length,
    accuracy: state.attempts.length ? Math.round((state.attempts.filter((a) => a.correct).length / state.attempts.length) * 100) : 0,
    bestStreak: streak.best,
    badges: Object.keys(state.badges).length,
    simulationsPassed: state.sessions.filter((s) => s.mode === "exam" && s.passed).length,
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="grid gap-4 md:grid-cols-3">
        <Card glow>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Level {lvl.level}</p>
          <p className="mt-1 font-display text-3xl font-bold">{lvl.rank}</p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={lvl.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" initial={reduce ? false : { width: 0 }} animate={{ width: `${lvl.pct}%` }} transition={{ type: "spring", stiffness: 60, damping: 15 }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {lvl.into} / {lvl.need} XP to level {lvl.level + 1} · {state.xp.toLocaleString()} total
          </p>
        </Card>
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between">
            <CardTitle>Stat card</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await navigator.clipboard?.writeText(JSON.stringify(profile, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              <Copy /> {copied ? "Copied!" : "Copy as JSON"}
            </Button>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Readiness", `${readiness}%`],
              ["Answered", profile.answered.toLocaleString()],
              ["Accuracy", profile.answered ? `${profile.accuracy}%` : "—"],
              ["Best streak", `${streak.best}d`],
              ["Current streak", `${streak.current}d`],
              ["Badges", `${profile.badges}/${BADGES.length}`],
              ["Sims passed", profile.simulationsPassed],
              ["Cards reviewed", Object.keys(state.cards).length],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-2xl bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Stats stay in this browser. Copy them as JSON for a backup.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle>Accuracy over time</CardTitle>
          <p className="text-xs text-muted-foreground">Daily accuracy, last 30 days</p>
          {state.attempts.length ? <AccuracyChart data={timeline} /> : <p className="grid h-64 place-items-center text-sm text-muted-foreground">Answer a few questions to see your trend.</p>}
        </Card>
        <Card>
          <CardTitle>Study calendar</CardTitle>
          <p className="mb-4 text-xs text-muted-foreground">Questions + card reviews per day</p>
          <HeatCalendar days={state.studyDays} />
        </Card>
      </div>

      <Card>
        <CardTitle>Domains</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Per-domain statistics</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 font-medium">Domain</th>
                <th className="py-2 text-right font-medium">Weight</th>
                <th className="py-2 text-right font-medium">Answered</th>
                <th className="py-2 text-right font-medium">Accuracy</th>
                <th className="py-2 text-right font-medium">Coverage</th>
                <th className="py-2 text-right font-medium">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const d = DOMAINS[s.domain - 1];
                return (
                  <tr key={d.id} className="border-t border-border/50">
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <DomainDot color={d.color} /> <span className="font-mono text-xs text-muted-foreground">D{d.id}</span> {d.name}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">{d.weight}%</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">{s.attempted}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">{s.attempted ? `${Math.round(s.accuracy * 100)}%` : "—"}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {s.uniqueSeen}/{s.bankSize}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold tabular-nums">{s.readiness}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Badges</CardTitle>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b, i) => {
            const at = state.badges[b.id];
            return (
              <motion.li
                key={b.id}
                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn("relative rounded-2xl border p-4", at ? "border-amber-400/40 bg-gradient-to-br from-amber-400/15 to-violet-500/10" : "border-border bg-muted/30")}
              >
                <span className={cn("text-3xl", !at && "opacity-30 grayscale")} aria-hidden>
                  {b.emoji}
                </span>
                {!at && <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground" aria-label="Locked" />}
                <p className="mt-2 text-sm font-semibold">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
                {at && <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">Unlocked {new Date(at).toLocaleDateString()}</p>}
              </motion.li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>Recent sessions</CardTitle>
        {state.sessions.length ? (
          <ul className="mt-3 divide-y divide-border/50">
            {[...state.sessions]
              .reverse()
              .slice(0, 12)
              .map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{MODE_LABEL[s.mode]}</span>
                    {s.domain && <span className="text-muted-foreground"> · D{s.domain}</span>}
                    <span className="block text-xs text-muted-foreground">{new Date(s.ts).toLocaleString()}</span>
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {s.scaled !== undefined ? `${s.scaled}/1000` : `${Math.round((s.correct / s.total) * 100)}%`}
                    <span className="block text-xs text-muted-foreground">
                      {s.correct}/{s.total}
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No sessions yet.</p>
        )}
      </Card>
    </div>
  );
}
