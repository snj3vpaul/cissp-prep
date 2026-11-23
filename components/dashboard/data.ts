"use client";

import { useMemo } from "react";
import type { AppState } from "@/lib/types";
import { domainStats, overallReadiness, weakestDomain, daysUntil, recommendedPace, accuracyTimeline } from "@/lib/stats";
import { computeStreak } from "@/lib/streak";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS } from "@/data/questions";
import { todayISO } from "@/lib/sm2";
import { levelFromXp } from "@/lib/level";
import { dueCardCount, dueForecast, xpSince } from "@/lib/derived";
import { recommendedLevel } from "@/lib/knowledge-check";
import { masteryModel } from "@/lib/mastery";

export function lastNDays(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    return { key: todayISO(d), date: d };
  });
}

export function useDashboardData(state: AppState) {
  return useMemo(() => {
    const stats = domainStats(state.attempts);
    const readiness = overallReadiness(stats);
    const weakest = DOMAINS[weakestDomain(stats) - 1];
    const streak = computeStreak(state.studyDays);
    const days = daysUntil(state.settings.examDate);
    const pace = recommendedPace(state, QUESTIONS.length);
    const today = todayISO();
    const todayCount = state.studyDays[today] ?? 0;
    const goal = pace ?? state.settings.dailyGoal;
    const correct = state.attempts.filter((a) => a.correct).length;
    const accuracy = state.attempts.length ? Math.round((correct / state.attempts.length) * 100) : null;
    const week = accuracyTimeline(state.attempts, 7);
    const activity = lastNDays(14).map((d) => ({ ...d, count: state.studyDays[d.key] ?? 0 }));
    const weekStart = (() => {
      const n = new Date();
      return new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6).getTime();
    })();
    return {
      stats,
      readiness,
      weakest,
      streak,
      days,
      pace,
      todayCount,
      goal,
      accuracy,
      week,
      activity,
      due: dueCardCount(state),
      forecast: dueForecast(state, 7),
      level: levelFromXp(state.xp),
      xpWeek: xpSince(state, weekStart),
      recommended: recommendedLevel(readiness, days),
      sessions: [...state.sessions].sort((a, b) => b.ts - a.ts),
      mastery: masteryModel(state),
    };
  }, [state]);
}

export type DashboardData = ReturnType<typeof useDashboardData>;
