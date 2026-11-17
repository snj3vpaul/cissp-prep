import { DOMAINS, EXAM_FORMAT, type DomainId } from "@/lib/domains";
import type { Attempt, Difficulty, Question } from "@/lib/types";
import { QUESTIONS, QUESTIONS_BY_DOMAIN } from "@/data/questions";

export function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Priority: never seen > previously missed > seen long ago. Adds randomness so sets vary. */
function prioritize(pool: Question[], attempts: Attempt[]) {
  const last = new Map<string, Attempt>();
  for (const a of attempts) last.set(a.qid, a);
  return shuffle(pool)
    .map((q) => {
      const a = last.get(q.id);
      // seen-and-correct items regain priority as they age (fully after 14 days)
      const score = !a ? 3 : !a.correct ? 2 : Math.min(1, (Date.now() - a.ts) / (14 * 86_400_000));
      return { q, score: score + Math.random() * 0.8 };
    })
    .sort((x, y) => y.score - x.score)
    .map((x) => x.q);
}

/** Allocate n items across domains proportionally to official weights (largest remainder). */
export function allocateByWeight(n: number): Record<DomainId, number> {
  const raw = DOMAINS.map((d) => ({ id: d.id, exact: (d.weight / 100) * n }));
  const base = raw.map((r) => ({ id: r.id, n: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let left = n - base.reduce((s, b) => s + b.n, 0);
  base.sort((a, b) => b.rem - a.rem).forEach((b) => {
    if (left > 0) {
      b.n++;
      left--;
    }
  });
  return Object.fromEntries(base.map((b) => [b.id, b.n])) as Record<DomainId, number>;
}

export function buildWeightedSet(n: number, attempts: Attempt[]): Question[] {
  const alloc = allocateByWeight(n);
  const out: Question[] = [];
  for (const d of DOMAINS) out.push(...prioritize(QUESTIONS_BY_DOMAIN[d.id], attempts).slice(0, alloc[d.id]));
  return shuffle(out);
}

export function buildDomainSet(domain: DomainId, n: number, attempts: Attempt[]): Question[] {
  return prioritize(QUESTIONS_BY_DOMAIN[domain], attempts).slice(0, n);
}

export function buildMissedSet(attempts: Attempt[], n = 20): Question[] {
  const last = new Map<string, Attempt>();
  for (const a of attempts) last.set(a.qid, a);
  const missed = [...last.values()].filter((a) => !a.correct).map((a) => a.qid);
  const set = new Set(missed);
  return shuffle(QUESTIONS.filter((q) => set.has(q.id))).slice(0, n);
}

/* ---------------- CAT-style adaptive exam ---------------- */

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

export interface ExamPlan {
  quotas: Record<DomainId, number>;
  total: number;
}

export function planExam(total = EXAM_FORMAT.simulationItems): ExamPlan {
  return { quotas: allocateByWeight(total), total };
}

/**
 * Pick the next item. Ability estimate moves up on a correct answer and down on a miss
 * (simple staircase), and the domain is chosen by remaining quota — mirroring how CAT
 * balances content while targeting the candidate's level.
 */
export function nextExamQuestion(plan: ExamPlan, served: Question[], results: boolean[]): Question | null {
  if (served.length >= plan.total) return null;
  const usedIds = new Set(served.map((q) => q.id));
  const servedPerDomain: Record<number, number> = {};
  served.forEach((q) => (servedPerDomain[q.domain] = (servedPerDomain[q.domain] ?? 0) + 1));

  // ability in [0, 2]: 0 easy, 1 medium, 2 hard
  let ability = 1;
  results.forEach((r) => (ability = Math.max(0, Math.min(2, ability + (r ? 0.34 : -0.5)))));
  const target = LEVELS[Math.round(ability)];

  // domain with largest remaining share of its quota
  const candidates = DOMAINS.map((d) => ({ id: d.id, remaining: plan.quotas[d.id] - (servedPerDomain[d.id] ?? 0) }))
    .filter((d) => d.remaining > 0)
    .sort((a, b) => b.remaining / plan.quotas[b.id] - a.remaining / plan.quotas[a.id] || Math.random() - 0.5);

  for (const c of candidates) {
    const pool = QUESTIONS_BY_DOMAIN[c.id].filter((q) => !usedIds.has(q.id));
    if (!pool.length) continue;
    const order = [target, ...LEVELS.filter((l) => l !== target).sort((a, b) => Math.abs(LEVELS.indexOf(a) - ability) - Math.abs(LEVELS.indexOf(b) - ability))];
    for (const lvl of order) {
      const atLevel = pool.filter((q) => q.difficulty === lvl);
      if (atLevel.length) return atLevel[Math.floor(Math.random() * atLevel.length)];
    }
  }
  // Quotas exhausted pools — fall back to any unused question.
  const rest = QUESTIONS.filter((q) => !usedIds.has(q.id));
  return rest.length ? rest[Math.floor(Math.random() * rest.length)] : null;
}

/**
 * Scaled score estimate (0–1000). Harder items are worth more, so a candidate who is being
 * served hard items and answering ~65% of them still scores well — similar in spirit to CAT.
 * This is a study aid, not ISC2's psychometric model.
 */
export function scaledScore(items: { difficulty: Difficulty; correct: boolean }[]) {
  if (!items.length) return 0;
  const w = { easy: 0.7, medium: 1, hard: 1.35 } as const;
  let earned = 0;
  let possible = 0;
  for (const i of items) {
    possible += 1;
    earned += i.correct ? w[i.difficulty] : 0;
  }
  const ratio = Math.min(1, earned / possible);
  return Math.round(Math.min(1000, Math.max(0, 1000 * Math.pow(ratio, 0.85))));
}
