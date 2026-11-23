"use client";

import { useSyncExternalStore } from "react";
import type { AppState, Attempt, CardState, Flashcard, SessionSummary, Settings } from "@/lib/types";
import { review, todayISO, newCardState, type Grade } from "@/lib/sm2";
import { evaluateBadges } from "@/lib/badges";
import { resolveOutline, setActiveOutline } from "@/lib/domains";

const syncOutline = (s: AppState) => setActiveOutline(resolveOutline(s.settings.outline, s.settings.examDate));

const KEY = "cissp-command-center:v1";
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
  recordSession(sum: SessionSummary) {
    set((s) => ({ ...s, xp: s.xp + (sum.mode === "exam" ? 100 : 20), sessions: [...s.sessions, sum].slice(-500) }));
  },
  reviewCard(id: string, grade: Grade) {
    set((s) => {
      const prev: CardState = s.cards[id] ?? newCardState();
      return { ...s, xp: s.xp + 3, cards: { ...s.cards, [id]: review(prev, grade) }, studyDays: bumpDay(s) };
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
