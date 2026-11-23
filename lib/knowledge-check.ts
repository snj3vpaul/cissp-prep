import type { Attempt, Difficulty, Question } from "@/lib/types";
import { QUESTIONS } from "@/data/questions";
import { allocateByWeight, prioritize, shuffle } from "@/lib/quiz";

/** Effort levels for the knowledge (fact) check, from a quick recall pass to an exam-pace marathon. */
export interface CheckLevel {
  name: string;
  n: number;
  mix: Record<Difficulty, number>;
  /** Total time limit in seconds; undefined = untimed. */
  time?: number;
  blurb: string;
}

export const CHECK_LEVELS: CheckLevel[] = [
  { name: "Low", n: 5, mix: { easy: 0.6, medium: 0.4, hard: 0 }, blurb: "Quick fact recall: definitions, ports, formulas." },
  { name: "Medium", n: 10, mix: { easy: 0.3, medium: 0.6, hard: 0.1 }, blurb: "Mostly applied facts, a little scenario work." },
  { name: "High", n: 20, mix: { easy: 0.1, medium: 0.6, hard: 0.3 }, blurb: "Scenario-heavy, manager-mindset questions." },
  { name: "Extra", n: 35, mix: { easy: 0, medium: 0.5, hard: 0.5 }, time: 35 * 72, blurb: "Half hard items on an exam-pace clock (72 s each)." },
  { name: "Galaxy", n: 60, mix: { easy: 0, medium: 0.45, hard: 0.55 }, time: 60 * 72, blurb: "60 items, hard-first, full exam pace. Bring coffee." },
];

export function clampLevel(raw: unknown) {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.max(0, Math.min(CHECK_LEVELS.length - 1, n)) : 1;
}

/**
 * Which level to suggest: build breadth first, then push difficulty as readiness rises,
 * and go long in the final two weeks before the exam.
 */
export function recommendedLevel(readiness: number, daysToExam: number | null) {
  if (daysToExam !== null && daysToExam >= 0 && daysToExam <= 14 && readiness >= 55) return 4;
  if (readiness < 25) return 1;
  if (readiness < 55) return 2;
  return 3;
}

/** Build the set: difficulty mix per level, spread across domains by official weight, unseen/missed first. */
export function buildCheckSet(level: number, attempts: Attempt[]): Question[] {
  const L = CHECK_LEVELS[clampLevel(level)];
  const alloc = allocateByWeight(L.n);
  const perDomain: Record<number, number> = {};
  const used = new Set<string>();
  const out: Question[] = [];

  const diffs: Difficulty[] = ["hard", "medium", "easy"];
  const want = Object.fromEntries(diffs.map((d) => [d, Math.round(L.mix[d] * L.n)])) as Record<Difficulty, number>;

  for (const d of diffs) {
    const pool = prioritize(QUESTIONS.filter((q) => q.difficulty === d), attempts);
    for (const q of pool) {
      if (want[d] <= 0 || out.length >= L.n) break;
      if ((perDomain[q.domain] ?? 0) >= alloc[q.domain] + 1) continue;
      out.push(q);
      used.add(q.id);
      perDomain[q.domain] = (perDomain[q.domain] ?? 0) + 1;
      want[d]--;
    }
  }
  // Top up (rounding, thin pools) from anything unused, still preferring unseen/missed.
  if (out.length < L.n) {
    for (const q of prioritize(QUESTIONS.filter((x) => !used.has(x.id)), attempts)) {
      if (out.length >= L.n) break;
      out.push(q);
    }
  }
  // Galaxy front-loads the hard items; other levels are shuffled.
  return clampLevel(level) === 4 ? out : shuffle(out);
}
