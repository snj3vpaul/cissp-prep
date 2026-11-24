import type { Difficulty, Question } from "@/lib/types";
import { DOMAINS, type DomainId } from "@/lib/domains";
import { QUESTIONS_BY_DOMAIN, QUESTIONS } from "@/data/questions";
import { allocateByWeight } from "@/lib/quiz";

/**
 * Computerized adaptive test, modelled on how ISC2 describes the CISSP CAT:
 *  - the first item is well below the passing standard;
 *  - after every answer, ability is re-estimated from the difficulty of all items presented
 *    and the answers given (Rasch / 1-parameter IRT, expected a posteriori);
 *  - the next item is the one that tells us most about that estimate (difficulty closest to
 *    it), balanced across domains by exam weight;
 *  - the test ends once the 95% confidence band is wholly above or below the passing standard
 *    (after the minimum length), or at the maximum length / time limit.
 * Item difficulties are three calibrated bands, not ISC2's per-item parameters, so the scaled
 * score is a practice estimate.
 */

export const DIFF_LOGIT: Record<Difficulty, number> = { easy: -1.6, medium: 0, hard: 1.4 };
export const PASS_THETA = 0.3; // passing standard on the ability scale
export const PASS_SCALED = 700;

export interface CatConfig {
  id: "full" | "mini";
  label: string;
  min: number;
  max: number;
  minutes: number;
}

export const CAT_CONFIGS: Record<CatConfig["id"], CatConfig> = {
  full: { id: "full", label: "Full CAT", min: 100, max: 150, minutes: 180 },
  mini: { id: "mini", label: "Mini CAT", min: 25, max: 60, minutes: 75 },
};

export interface Estimate {
  theta: number;
  se: number;
}

const GRID = Array.from({ length: 121 }, (_, i) => -4 + i / 15);

/** EAP ability estimate with a standard-normal prior. */
export function estimate(resp: { difficulty: Difficulty; correct: boolean }[]): Estimate {
  const lw = GRID.map((t) => -(t ** 2) / 2);
  for (const r of resp) {
    const b = DIFF_LOGIT[r.difficulty];
    for (let i = 0; i < GRID.length; i++) {
      const p = 1 / (1 + Math.exp(-(GRID[i] - b)));
      lw[i] += Math.log(r.correct ? p : 1 - p);
    }
  }
  const mx = Math.max(...lw);
  const w = lw.map((x) => Math.exp(x - mx));
  const s = w.reduce((a, b) => a + b, 0);
  const theta = w.reduce((a, x, i) => a + x * GRID[i], 0) / s;
  const v = w.reduce((a, x, i) => a + x * (GRID[i] - theta) ** 2, 0) / s;
  return { theta, se: Math.sqrt(v) };
}

export const toScaled = (theta: number) => Math.max(0, Math.min(1000, Math.round(PASS_SCALED + (theta - PASS_THETA) * 170)));
export const bandScaled = (e: Estimate) => ({ lo: toScaled(e.theta - 1.96 * e.se), hi: toScaled(e.theta + 1.96 * e.se) });

/** Running estimate after each answer (for the confidence graph). */
export function trajectory(resp: { difficulty: Difficulty; correct: boolean }[]) {
  return resp.map((_, i) => estimate(resp.slice(0, i + 1)));
}

export type Verdict = "pass" | "fail" | "pass-at-max" | "fail-at-max" | "incomplete";

export function shouldStop(cfg: CatConfig, n: number, e: Estimate) {
  if (n >= cfg.max) return true;
  if (n < cfg.min) return false;
  const lo = e.theta - 1.96 * e.se;
  const hi = e.theta + 1.96 * e.se;
  return lo > PASS_THETA || hi < PASS_THETA;
}

/** ISC2-style outcome: confident decision, or at max length compare the estimate to the standard; out of time before the minimum fails. */
export function verdict(cfg: CatConfig, n: number, e: Estimate): Verdict {
  if (n < cfg.min) return "incomplete";
  const lo = e.theta - 1.96 * e.se;
  const hi = e.theta + 1.96 * e.se;
  if (lo > PASS_THETA) return "pass";
  if (hi < PASS_THETA) return "fail";
  return e.theta >= PASS_THETA ? "pass-at-max" : "fail-at-max";
}
export const isPass = (v: Verdict) => v === "pass" || v === "pass-at-max";

const info = (theta: number, d: Difficulty) => {
  const p = 1 / (1 + Math.exp(-(theta - DIFF_LOGIT[d])));
  return p * (1 - p);
};

/** Next item: most informative difficulty for the current estimate, from the most under-served domain. */
export function nextCatItem(cfg: CatConfig, served: Question[], e: Estimate | null): Question | null {
  if (served.length >= cfg.max) return null;
  const used = new Set(served.map((q) => q.id));
  // First item: well below the passing standard.
  const theta = e ? e.theta : DIFF_LOGIT.easy - 0.5;
  const quotas = allocateByWeight(cfg.max);
  const per: Record<number, number> = {};
  served.forEach((q) => (per[q.domain] = (per[q.domain] ?? 0) + 1));
  const domains = DOMAINS.map((d) => d.id as DomainId).sort(
    (a, b) => (per[a] ?? 0) / quotas[a] - (per[b] ?? 0) / quotas[b] || Math.random() - 0.5
  );
  const levels = (["easy", "medium", "hard"] as Difficulty[]).sort((a, b) => info(theta, b) - info(theta, a));
  for (const lvl of levels) {
    for (const d of domains.slice(0, 3)) {
      const pool = QUESTIONS_BY_DOMAIN[d].filter((q) => q.difficulty === lvl && !used.has(q.id));
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  const rest = QUESTIONS.filter((q) => !used.has(q.id));
  return rest.length ? rest[Math.floor(Math.random() * rest.length)] : null;
}
