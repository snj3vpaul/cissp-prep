"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Brain, CalendarClock, Layers, Swords, Target, Timer, Trophy, Zap } from "lucide-react";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { domainStats, overallReadiness, weakestDomain, daysUntil, recommendedPace } from "@/lib/stats";
import { computeStreak } from "@/lib/streak";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS } from "@/data/questions";
import { FLASHCARDS } from "@/data/flashcards";
import { todayISO } from "@/lib/sm2";
import { Card, CardTitle, DomainDot, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { ReadinessRadar } from "@/components/dashboard/readiness-radar";
import { levelFromXp } from "@/lib/level";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-72 lg:col-span-2" />
      <Skeleton className="h-72" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
}

export function Dashboard() {
  const state = useAppState();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();

  const stats = useMemo(() => domainStats(state.attempts), [state.attempts]);
  const readiness = overallReadiness(stats);
  const weakest = DOMAINS[weakestDomain(stats) - 1];
  const streak = computeStreak(state.studyDays);
  const days = daysUntil(state.settings.examDate);
  const pace = recommendedPace(state, QUESTIONS.length);
  const today = todayISO();
  const todayCount = state.studyDays[today] ?? 0;
  const goal = pace ?? state.settings.dailyGoal;
  const allCards = FLASHCARDS.length + state.customCards.length;
  const dueCards = [...FLASHCARDS, ...state.customCards].filter((c) => {
    const s = state.cards[c.id];
    return s && s.dueDate <= today;
  }).length;
  const newCards = allCards - Object.keys(state.cards).length;
  const correct = state.attempts.filter((a) => a.correct).length;
  const accuracy = state.attempts.length ? Math.round((correct / state.attempts.length) * 100) : 0;
  const level = levelFromXp(state.xp);

  if (!hydrated) return <DashboardSkeleton />;

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className="space-y-4 pb-16">
      {/* Greeting row */}
      <motion.div {...item(0)} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting()}
            {state.settings.name ? `, ${state.settings.name}` : ""} 👋
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            Command <span className="text-gradient">Center</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" aria-label={`${streak.current} day study streak`}>
            <motion.span
              aria-hidden
              animate={reduce || streak.current === 0 ? undefined : { scale: [1, 1.18, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-lg"
            >
              🔥
            </motion.span>
            {streak.current} day streak
          </span>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-violet-400" aria-hidden /> Lv {level.level} · {state.xp.toLocaleString()} XP
          </span>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Readiness + radar */}
        <motion.div {...item(1)} className="lg:col-span-2">
          <Card glow className="h-full">
            <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-3 text-center">
                <ProgressRing value={readiness} size={156} stroke={12} label={`Overall readiness ${readiness}%`} />
                <div>
                  <p className="font-display font-semibold">Exam readiness</p>
                  <p className="max-w-[200px] text-xs text-muted-foreground">
                    Weighted by official domain weights, accuracy and coverage.
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle>Domain radar</CardTitle>
                  <Link href="/progress" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                    Details →
                  </Link>
                </div>
                <ReadinessRadar stats={stats} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Smart suggestion */}
        <motion.div {...item(2)}>
          <Card className="relative flex h-full flex-col overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10">
            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/20">
              <Brain className="h-5 w-5 text-violet-500 dark:text-violet-300" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold">Study 10 minutes now</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your biggest opportunity is <span className="font-semibold text-foreground">Domain {weakest.id}: {weakest.name}</span> ({weakest.weight}% of the exam).
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <DomainDot color={weakest.color} /> {stats[weakest.id - 1].attempted ? `${stats[weakest.id - 1].readiness}% ready · ${stats[weakest.id - 1].uniqueSeen}/${stats[weakest.id - 1].bankSize} seen` : "Not started yet"}
            </div>
            <div className="mt-auto pt-6">
              <Button asChild className="w-full">
                <Link href={`/quiz/${weakest.slug}?n=10`}>
                  Start 10-question drill <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Countdown */}
        <motion.div {...item(3)}>
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-cyan-500 dark:text-cyan-300" aria-hidden />
              <CardTitle>Exam countdown</CardTitle>
            </div>
            {days !== null && days >= 0 ? (
              <>
                <p className="mt-3 font-display text-5xl font-bold tabular-nums">{days}</p>
                <p className="text-sm text-muted-foreground">{days === 1 ? "day" : "days"} to go</p>
                {pace && (
                  <p className="mt-3 rounded-xl bg-cyan-500/10 px-3 py-2 text-sm">
                    Recommended pace: <span className="font-semibold">{pace} questions/day</span>
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{days !== null ? "Your exam date has passed — set a new one." : "Set your exam date to get a daily pace."}</p>
            )}
            <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="exam-date">
              Exam date
            </label>
            <input
              id="exam-date"
              type="date"
              min={today}
              value={state.settings.examDate ?? ""}
              onChange={(e) => actions.updateSettings({ examDate: e.target.value || undefined })}
              className="mt-1 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm [color-scheme:light] dark:[color-scheme:dark]"
            />
          </Card>
        </motion.div>

        {/* Today */}
        <motion.div {...item(4)}>
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" aria-hidden />
              <CardTitle>Today’s mission</CardTitle>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={Math.min(100, Math.round((todayCount / goal) * 100))} size={88} stroke={8} label={`${todayCount} of ${goal} items today`}>
                <span className="font-display text-lg font-bold tabular-nums">{todayCount}</span>
              </ProgressRing>
              <div>
                <p className="font-semibold">
                  {todayCount} / {goal} items
                </p>
                <p className="text-xs text-muted-foreground">Questions and flashcard reviews both count.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/quiz/quick">
                  <Zap /> Quick 10
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/flashcards">
                  <Layers /> {dueCards ? `${dueCards} due` : "Cards"}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div {...item(5)}>
          <Card className="h-full">
            <CardTitle>At a glance</CardTitle>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: Swords, label: "Answered", value: state.attempts.length.toLocaleString() },
                { icon: Target, label: "Accuracy", value: state.attempts.length ? `${accuracy}%` : "—" },
                { icon: Layers, label: "New cards", value: newCards.toLocaleString() },
                { icon: Trophy, label: "Badges", value: Object.keys(state.badges).length },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted/50 p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-bold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </motion.div>
      </div>

      {/* Domains list */}
      <motion.div {...item(6)}>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Domains</CardTitle>
            <Link href="/exam" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Timer className="h-3.5 w-3.5" aria-hidden /> Full exam simulation →
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {stats.map((s) => {
              const d = DOMAINS[s.domain - 1];
              return (
                <li key={d.id}>
                  <Link href={`/quiz/${d.slug}`} className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-accent/60">
                    <DomainDot color={d.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          <span className="font-mono text-xs text-muted-foreground">D{d.id}</span> {d.name}
                        </p>
                        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{s.readiness}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: d.color }}
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${s.readiness}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 16 }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
