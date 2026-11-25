/**
 * F1-style race layered on top of any quiz or exam. Each question is a lap.
 *  - Correct answer: you overtake the car ahead (once leading, you pull away instead).
 *  - Wrong answer: a lock-up. Two in a row and the car behind gets past you; when leading,
 *    a miss eats into your gap and you lose the lead once the gap is gone.
 * The race is derived from the answers alone, so the live strip and the final
 * classification always agree.
 */
import type { Question } from "@/lib/types";

/** Rival grid: invented three-letter codes, no real drivers or teams. */
export const RIVALS = ["ACL", "MFA", "PKI", "SOC", "DLP", "IDS", "WAF", "XDR", "VPN", "HSM", "TLS", "IAM", "RTO", "SLA", "BCP", "DMZ", "CVE", "OTP", "KMS"];

export interface RaceAnswer {
  correct: boolean;
  ms: number;
}

export type RaceEvent = { kind: "start" } | { kind: "overtake"; passed: string } | { kind: "extend"; gap: number } | { kind: "lockup"; warn: boolean } | { kind: "overtaken"; by: string } | { kind: "lost-lead"; by: string };

export interface RaceState {
  order: string[]; // running order, index 0 = P1
  you: string;
  lap: number; // laps completed
  totalLaps: number;
  overtakes: number;
  lostPlaces: number;
  startPos: number;
  bestPos: number;
  gap: number; // seconds ahead of P2 while leading
  missStreak: number;
  event: RaceEvent;
  speed: number; // km/h on the last lap
  fastestLap: { lap: number; ms: number } | null;
}

export function driverCode(name?: string) {
  const letters = (name ?? "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return letters.length >= 3 ? letters.slice(0, 3) : "YOU";
}

/** Start from the back of a grid sized to the session (6–20 cars), so a clean run can win. */
export function raceInit(totalLaps: number, you = "YOU"): RaceState {
  const grid = Math.max(6, Math.min(20, totalLaps + 1));
  const rivals = RIVALS.filter((r) => r !== you).slice(0, grid - 1);
  return { order: [...rivals, you], you, lap: 0, totalLaps, overtakes: 0, lostPlaces: 0, startPos: grid, bestPos: grid, gap: 0, missStreak: 0, event: { kind: "start" }, speed: 0, fastestLap: null };
}

export function position(s: RaceState) {
  return s.order.indexOf(s.you) + 1;
}

/** Faster answers mean a faster lap: 340 km/h at 5 s or less, down to 160 km/h at a minute. */
export function lapSpeed(a: RaceAnswer) {
  const sec = a.ms / 1000;
  if (!a.correct) return Math.round(95 + Math.min(45, Math.max(0, 30 - sec)));
  return Math.round(340 - Math.min(180, Math.max(0, sec - 5) * 3.3));
}

export function raceStep(s: RaceState, a: RaceAnswer): RaceState {
  const order = [...s.order];
  const i = order.indexOf(s.you);
  const lap = s.lap + 1;
  const speed = lapSpeed(a);
  let { overtakes, lostPlaces, gap, missStreak } = s;
  let event: RaceEvent;
  if (a.correct) {
    missStreak = 0;
    if (i > 0) {
      const passed = order[i - 1];
      [order[i - 1], order[i]] = [order[i], order[i - 1]];
      overtakes++;
      event = { kind: "overtake", passed };
      if (i - 1 === 0) gap = 0.3;
    } else {
      gap = Math.round((gap + 0.4 + Math.max(0, (speed - 160) / 900)) * 10) / 10;
      event = { kind: "extend", gap };
    }
  } else {
    missStreak++;
    if (i === 0) {
      gap = Math.round((gap - 0.8) * 10) / 10;
      if (gap <= 0 && order.length > 1) {
        const by = order[1];
        [order[0], order[1]] = [order[1], order[0]];
        lostPlaces++;
        gap = 0;
        missStreak = 0;
        event = { kind: "lost-lead", by };
      } else event = { kind: "lockup", warn: false };
    } else if (missStreak >= 2 && i < order.length - 1) {
      const by = order[i + 1];
      [order[i], order[i + 1]] = [order[i + 1], order[i]];
      lostPlaces++;
      missStreak = 0;
      event = { kind: "overtaken", by };
    } else event = { kind: "lockup", warn: i < order.length - 1 };
  }
  const fastestLap = a.correct && (!s.fastestLap || a.ms < s.fastestLap.ms) ? { lap, ms: a.ms } : s.fastestLap;
  const next = { ...s, order, lap, overtakes, lostPlaces, gap, missStreak, event, speed, fastestLap };
  return { ...next, bestPos: Math.min(s.bestPos, position(next)) };
}

export function runRace(answers: RaceAnswer[], totalLaps: number, you?: string) {
  return answers.reduce(raceStep, raceInit(totalLaps, you));
}

export function eventText(s: RaceState): string {
  const e = s.event;
  switch (e.kind) {
    case "start":
      return `Lights out. You start P${s.startPos} of ${s.order.length}.`;
    case "overtake":
      return position(s) === 1 ? `Into the lead! Passed ${e.passed}.` : `Overtake! Passed ${e.passed} for P${position(s)}.`;
    case "extend":
      return `Leading by ${e.gap.toFixed(1)}s.`;
    case "lockup":
      return position(s) === 1 ? `Lock-up. Lead down to ${s.gap.toFixed(1)}s.` : e.warn ? "Lock-up. The car behind has DRS: one more miss and it's past." : "Lock-up. Position held.";
    case "overtaken":
      return `${e.by} got past. Down to P${position(s)}.`;
    case "lost-lead":
      return `${e.by} takes the lead. You're P2.`;
  }
}

// ── Final classification ──────────────────────────────────────────────

export interface RestudyItem {
  sub: string;
  domain: number;
  missed: number;
  total: number;
  questions: Question[];
  ref?: { title: string; url?: string };
}

export interface RaceReport {
  finish: number;
  grid: number;
  startPos: number;
  gained: number;
  overtakes: number;
  lostPlaces: number;
  fastestLap: { lap: number; ms: number } | null;
  /** Correct answers: questions that topped your mind. */
  excellence: number;
  /** Correct and faster than your own median: instant recall. */
  instant: number;
  mastered: { sub: string; domain: number; n: number }[];
  restudy: RestudyItem[];
}

export function raceReport(results: { question: Question; correct: boolean; ms: number }[], totalLaps: number, you?: string): RaceReport {
  const s = runRace(results, totalLaps, you);
  const sorted = results.map((r) => r.ms).sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const bySub = new Map<string, { domain: number; c: number; t: number; qs: Question[] }>();
  for (const r of results) {
    const e = bySub.get(r.question.subObjective) ?? { domain: r.question.domain, c: 0, t: 0, qs: [] };
    e.t++;
    if (r.correct) e.c++;
    else e.qs.push(r.question);
    bySub.set(r.question.subObjective, e);
  }
  const mastered = [...bySub].filter(([, e]) => e.c === e.t).map(([sub, e]) => ({ sub, domain: e.domain, n: e.t })).sort((a, b) => b.n - a.n || a.sub.localeCompare(b.sub, undefined, { numeric: true }));
  const restudy = [...bySub]
    .filter(([, e]) => e.c < e.t)
    .map(([sub, e]) => {
      const ref = e.qs[0]?.references.find((x) => x.kind === "book") ?? e.qs[0]?.references.find((x) => x.kind !== "outline") ?? e.qs[0]?.references[0];
      return { sub, domain: e.domain, missed: e.t - e.c, total: e.t, questions: e.qs, ref: ref ? { title: ref.title, url: ref.url } : undefined };
    })
    .sort((a, b) => b.missed / b.total - a.missed / a.total || b.missed - a.missed);
  const finish = position(s);
  return {
    finish,
    grid: s.order.length,
    startPos: s.startPos,
    gained: s.startPos - finish,
    overtakes: s.overtakes,
    lostPlaces: s.lostPlaces,
    fastestLap: s.fastestLap,
    excellence: results.filter((r) => r.correct).length,
    instant: results.filter((r) => r.correct && r.ms <= median).length,
    mastered,
    restudy,
  };
}
