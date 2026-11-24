"use client";

import { useSyncExternalStore } from "react";
import type { AppState, Attempt, CardState, Flashcard, SessionSummary, Settings } from "@/lib/types";
import { review, todayISO, newCardState, type Grade } from "@/lib/sm2";
import { evaluateBadges } from "@/lib/badges";
import { resolveOutline, setActiveOutline } from "@/lib/domains";

const syncOutline = (s: AppState) => {
  if (TRACK_ID === "cissp") setActiveOutline(resolveOutline(s.settings.outline, s.settings.examDate));
};

import { TRACK, TRACK_ID } from "@/lib/track";

/** Each study track keeps its own saved progress. */
const KEY = TRACK.storageKey;
export const STATE_VERSION = 1;
const MAX_ATTEMPTS = 5000;

export const DEFAULT_STATE: AppState = {
  version: STATE_VERSION,
  xp: 0,
  attempts: [],
  sessions: [],
  cards: {},
  customCards: [],
  studyDays: {},
  badges: {},
  settings: { sound: false, haptics: true, dailyGoal: 20 },
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) } };
    }
  } catch {
    state = DEFAULT_STATE;
  }
  syncOutline(state);
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — keep in memory */
  }
}

function set(updater: (s: AppState) => AppState) {
  load();
  const next = updater(state);
  const newBadges = evaluateBadges(next);
  state = newBadges.length
    ? { ...next, badges: { ...next.badges, ...Object.fromEntries(newBadges.map((b) => [b, Date.now()])) }, xp: next.xp + newBadges.length * 50 }
    : next;
  syncOutline(state);
  persist();
  listeners.forEach((l) => l());
  if (newBadges.length && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cc:badges", { detail: newBadges }));
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => DEFAULT_STATE;

export function useAppState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True after the first client render — use to show skeletons instead of empty-state flashes. */
const noopSubscribe = () => () => {};
export function useHydrated() {
  // false during SSR and the hydration pass, true on every client render after — no effect needed.
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const bumpDay = (s: AppState, n = 1) => {
  const d = todayISO();
  return { ...s.studyDays, [d]: (s.studyDays[d] ?? 0) + n };
};

const XP_BY_DIFF = { easy: 8, medium: 10, hard: 15 } as const;

export const actions = {
  recordAttempt(a: Attempt) {
    set((s) => ({
      ...s,
      xp: s.xp + (a.correct ? XP_BY_DIFF[a.difficulty] : 2),
      attempts: [...s.attempts, a].slice(-MAX_ATTEMPTS),
      studyDays: bumpDay(s),
    }));
  },
  /** Log a result taken on another platform (e.g. QuantumExams). No XP: it wasn't earned here. */
  recordExternal(sum: SessionSummary) {
    set((s) => ({ ...s, sessions: [...s.sessions, sum].sort((a, b) => a.ts - b.ts).slice(-500) }));
  },
  removeSession(id: string) {
    set((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  },
  recordSession(sum: SessionSummary) {
    set((s) => ({ ...s, xp: s.xp + (sum.mode === "exam" ? 100 : 20), sessions: [...s.sessions, sum].slice(-500) }));
  },
  reviewCard(id: string, grade: Grade) {
    set((s) => {
      const prev: CardState = s.cards[id] ?? newCardState();
      const d = todayISO();
      const day = s.memoryDays?.[d] ?? { n: 0, recalled: 0 };
      return {
        ...s,
        xp: s.xp + 3,
        cards: { ...s.cards, [id]: review(prev, grade) },
        studyDays: bumpDay(s),
        memoryDays: { ...s.memoryDays, [d]: { n: day.n + 1, recalled: day.recalled + (grade === "again" ? 0 : 1) } },
      };
    });
  },
  grantCores(grants: NonNullable<AppState["cores"]>["grants"], processed: string[]) {
    if (!grants.length && !processed.length) return;
    set((s) => {
      const prev = s.cores ?? { grants: [], processed: [] };
      return { ...s, xp: s.xp + grants.length * 40, cores: { ...prev, grants: [...prev.grants, ...grants], processed: [...prev.processed, ...processed] } };
    });
  },
  /** Mark reveals as watched: n more, or all of them. */
  seeCores(n?: number) {
    set((s) => {
      if (!s.cores) return s;
      const seen = n === undefined ? s.cores.grants.length : Math.min(s.cores.grants.length, (s.cores.seen ?? 0) + n);
      return { ...s, cores: { ...s.cores, seen } };
    });
  },
  addCustomCards(cards: Flashcard[]) {
    set((s) => {
      const existing = new Set(s.customCards.map((c) => c.id));
      return { ...s, customCards: [...s.customCards, ...cards.filter((c) => !existing.has(c.id))] };
    });
  },
  removeCustomCard(id: string) {
    set((s) => ({ ...s, customCards: s.customCards.filter((c) => c.id !== id) }));
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  importState(next: AppState) {
    set(() => ({ ...DEFAULT_STATE, ...next, settings: { ...DEFAULT_STATE.settings, ...next.settings } }));
  },
  reset() {
    set(() => ({ ...DEFAULT_STATE, settings: state.settings }));
  },
  exportState(): AppState {
    load();
    return state;
  },
};
