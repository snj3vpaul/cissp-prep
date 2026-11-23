import type { AppState, SessionSummary } from "@/lib/types";
import { FLASHCARDS } from "@/data/flashcards";
import { todayISO } from "@/lib/sm2";
import { getDomain } from "@/lib/domains";
import { CHECK_LEVELS } from "@/lib/knowledge-check";

export function dueCardCount(state: AppState, onOrBefore = todayISO()) {
  let n = 0;
  for (const c of [...FLASHCARDS, ...state.customCards]) {
    const s = state.cards[c.id];
    if (s && s.dueDate <= onOrBefore) n++;
  }
  return n;
}

/** Due-card forecast for the next `days` days (index 0 = today, includes overdue). */
export function dueForecast(state: AppState, days = 7) {
  const out = Array.from({ length: days }, () => 0);
  const base = new Date();
  const keys = out.map((_, i) => todayISO(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  for (const s of Object.values(state.cards)) {
    const i = keys.findIndex((k) => s.dueDate <= k);
    if (i >= 0) out[i]++;
  }
  return out;
}

const XP_BY_DIFF = { easy: 8, medium: 10, hard: 15 } as const;

/** XP a session earned: its answers (same scoring as the store) plus the completion bonus. */
export function sessionXp(state: AppState, s: SessionSummary) {
  const from = s.ts - s.ms - 2000;
  let xp = s.mode === "exam" ? 100 : 20;
  for (const a of state.attempts) {
    if (a.mode === s.mode && a.ts >= from && a.ts <= s.ts) xp += a.correct ? XP_BY_DIFF[a.difficulty] : 2;
  }
  return xp;
}

export function xpSince(state: AppState, sinceTs: number) {
  let xp = 0;
  for (const a of state.attempts) if (a.ts >= sinceTs) xp += a.correct ? XP_BY_DIFF[a.difficulty] : 2;
  for (const s of state.sessions) if (s.ts >= sinceTs) xp += s.mode === "exam" ? 100 : 20;
  return xp;
}

export function sessionTitle(s: SessionSummary) {
  switch (s.mode) {
    case "domain":
      return s.domain ? `D${s.domain} ${getDomain(s.domain).short}` : "Domain drill";
    case "quick":
      return "Quick 10";
    case "timed":
      return "Timed 25";
    case "missed":
      return "Missed review";
    case "exam":
      return "Exam simulation";
    case "check":
      return `Knowledge check${s.level !== undefined ? ` · ${CHECK_LEVELS[s.level]?.name ?? ""}` : ""}`;
  }
}

export function sessionKind(s: SessionSummary) {
  const mins = Math.max(1, Math.round(s.ms / 60000));
  const kind = s.mode === "exam" ? "Simulation" : s.mode === "domain" ? "Domain drill" : s.mode === "check" ? "Fact check" : "Mixed quiz";
  return `${kind} · ${mins} min`;
}
