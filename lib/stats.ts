import { DOMAINS, type DomainId } from "@/lib/domains";
import type { Attempt, AppState } from "@/lib/types";
import { QUESTIONS_BY_DOMAIN } from "@/data/questions";
import { todayISO } from "@/lib/sm2";

export interface DomainStat {
  domain: DomainId;
  attempted: number;
  correct: number;
  accuracy: number; // 0..1 lifetime
  recentAccuracy: number; // 0..1, recency weighted
  uniqueSeen: number;
  bankSize: number;
  readiness: number; // 0..100
}

/** Exponentially recency-weighted accuracy: newer answers count more (half-life ≈ 20 answers). */
function weightedAccuracy(list: Attempt[]) {
  if (!list.length) return 0;
  let num = 0;
  let den = 0;
  const n = list.length;
  list.forEach((a, i) => {
    const w = Math.pow(0.966, n - 1 - i);
    const dw = a.difficulty === "hard" ? 1.25 : a.difficulty === "easy" ? 0.8 : 1;
    num += (a.correct ? 1 : 0) * w * dw;
    den += w * dw;
  });
  return num / den;
}

export function domainStats(attempts: Attempt[]): DomainStat[] {
  return DOMAINS.map((d) => {
    const list = attempts.filter((a) => a.domain === d.id);
    const correct = list.filter((a) => a.correct).length;
    const uniqueSeen = new Set(list.map((a) => a.qid)).size;
    const bankSize = QUESTIONS_BY_DOMAIN[d.id]?.length ?? 0;
    const recentAccuracy = weightedAccuracy(list);
    // Coverage: you need to have seen ~2/3 of the domain bank for full credit.
    const coverage = bankSize ? Math.min(1, uniqueSeen / Math.max(10, Math.round(bankSize * 0.66))) : 0;
    const readiness = Math.round(100 * recentAccuracy * (0.35 + 0.65 * coverage));
    return {
      domain: d.id,
      attempted: list.length,
      correct,
      accuracy: list.length ? correct / list.length : 0,
      recentAccuracy,
      uniqueSeen,
      bankSize,
      readiness,
    };
  });
}

export function overallReadiness(stats: DomainStat[]) {
  return Math.round(stats.reduce((acc, s) => acc + (s.readiness * DOMAINS.find((d) => d.id === s.domain)!.weight) / 100, 0));
}

export function weakestDomain(stats: DomainStat[]): DomainId {
  // Untouched domains first (heaviest weight wins), then lowest readiness weighted by exam weight.
  const untouched = stats.filter((s) => s.attempted === 0);
  if (untouched.length) {
    return untouched.sort((a, b) => DOMAINS[b.domain - 1].weight - DOMAINS[a.domain - 1].weight)[0].domain;
  }
  return [...stats].sort((a, b) => a.readiness - DOMAINS[a.domain - 1].weight / 4 - (b.readiness - DOMAINS[b.domain - 1].weight / 4))[0].domain;
}

export function daysUntil(dateISO?: string) {
  if (!dateISO) return null;
  const [y, m, d] = dateISO.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = todayISO().split("-").map(Number);
  const today = new Date(ty, tm - 1, td).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** Questions/day needed to see the full bank twice plus 2 full simulations before exam day. */
export function recommendedPace(state: AppState, totalQuestions: number) {
  const days = daysUntil(state.settings.examDate);
  if (days === null || days <= 0) return null;
  const target = totalQuestions * 2 + 250;
  const remaining = Math.max(0, target - state.attempts.length);
  return Math.max(10, Math.ceil(remaining / days));
}

/** Accuracy per day for the last N days (null where nothing answered). */
export function accuracyTimeline(attempts: Attempt[], days = 30) {
  const byDay = new Map<string, { c: number; t: number }>();
  for (const a of attempts) {
    const d = todayISO(new Date(a.ts));
    const e = byDay.get(d) ?? { c: 0, t: 0 };
    e.t++;
    if (a.correct) e.c++;
    byDay.set(d, e);
  }
  const out: { date: string; label: string; accuracy: number | null; answered: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = todayISO(dt);
    const e = byDay.get(key);
    out.push({
      date: key,
      label: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      accuracy: e ? Math.round((e.c / e.t) * 100) : null,
      answered: e?.t ?? 0,
    });
  }
  return out;
}

export function subObjectiveBreakdown(attempts: { sub: string; correct: boolean }[]) {
  const m = new Map<string, { c: number; t: number }>();
  for (const a of attempts) {
    const e = m.get(a.sub) ?? { c: 0, t: 0 };
    e.t++;
    if (a.correct) e.c++;
    m.set(a.sub, e);
  }
  return [...m.entries()]
    .map(([sub, e]) => ({ sub, correct: e.c, total: e.t, pct: Math.round((e.c / e.t) * 100) }))
    .sort((a, b) => a.sub.localeCompare(b.sub, undefined, { numeric: true }));
}
