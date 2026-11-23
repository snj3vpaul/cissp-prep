import type { AppState } from "@/lib/types";
import { DOMAINS, type DomainId } from "@/lib/domains";
import { domainStats } from "@/lib/stats";
import { QUESTIONS } from "@/data/questions";

const XP_BY_DIFF = { easy: 8, medium: 10, hard: 15 } as const;
const QBY = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Per-domain level from distinct questions answered correctly: 1 + one level per 4, capped at 9. */
export function domainLevel(correctUnique: number) {
  return Math.min(9, 1 + Math.floor(correctUnique / 4));
}

export function masteryModel(state: AppState) {
  const stats = domainStats(state.attempts);
  const correctIds = new Map<DomainId, Set<string>>();
  for (const a of state.attempts) {
    if (!a.correct) continue;
    if (!correctIds.has(a.domain)) correctIds.set(a.domain, new Set());
    correctIds.get(a.domain)!.add(a.qid);
  }
  const domains = DOMAINS.map((d, i) => {
    const s = stats[i];
    const known = correctIds.get(d.id)?.size ?? 0;
    return { domain: d, mastery: s.readiness, attempted: s.attempted, known, level: domainLevel(known) };
  });
  const learnedQuestions = [...correctIds.values()].reduce((n, s) => n + s.size, 0);
  const learnedCards = Object.values(state.cards).filter((c) => c.repetitions > 0).length;
  const avg = Math.round(domains.reduce((n, d) => n + d.mastery, 0) / domains.length);

  // Recently learned: newest first, one entry per question, only first-time-correct or a fix of a past miss.
  const seenBefore = new Map<string, boolean>(); // qid -> was ever correct before this point
  const learned: { qid: string; domain: DomainId; stem: string; ts: number; xp: number; fixed: boolean }[] = [];
  for (const a of state.attempts) {
    const prev = seenBefore.get(a.qid);
    if (a.correct && prev !== true) {
      const q = QBY.get(a.qid);
      if (q) learned.push({ qid: a.qid, domain: a.domain, stem: q.stem, ts: a.ts, xp: XP_BY_DIFF[a.difficulty], fixed: prev === false });
    }
    seenBefore.set(a.qid, prev === true || a.correct);
  }
  learned.sort((x, y) => y.ts - x.ts);

  return { domains, avg, items: learnedQuestions + learnedCards, learnedQuestions, learnedCards, recent: learned.slice(0, 6) };
}

export function timeAgo(ts: number, now = Date.now()) {
  const m = Math.round((now - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
