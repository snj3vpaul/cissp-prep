import type { DomainId } from "@/lib/domains";

export type Difficulty = "easy" | "medium" | "hard";

/** A study reference cited by a question. */
export interface Reference {
  kind: "outline" | "book" | "nist" | "rfc" | "law" | "owasp" | "industry";
  title: string;
  publisher: string;
  url?: string;
  key?: string; // library key, when the reference comes from data/references/library.ts
}

export interface Question {
  id: string;
  domain: DomainId;
  subObjective: string; // e.g. "1.1"
  difficulty: Difficulty;
  stem: string;
  options: string[]; // exactly 4
  answerIndex: number;
  rationale: string; // why correct AND why others are wrong
  mindsetHint?: string; // "think like a manager" nudge
  references: Reference[]; // study references (outline objective, Official Study Guide chapter, authoritative sources)
}

export interface Flashcard {
  id: string;
  domain: number;
  front: string;
  back: string;
  mnemonic?: string;
  interval: number; // SM-2 state (days)
  easeFactor: number;
  dueDate: string; // ISO date
}

/** Per-card scheduling state persisted in localStorage (overrides seed defaults). */
export interface CardState {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: string;
  lapses: number;
  lastReviewed?: string;
}

export interface Attempt {
  qid: string;
  domain: DomainId;
  sub: string;
  difficulty: Difficulty;
  correct: boolean;
  ms: number;
  ts: number;
  mode: QuizMode;
}

export type QuizMode = "quick" | "domain" | "timed" | "exam" | "missed";

export interface SessionSummary {
  id: string;
  mode: QuizMode;
  domain?: DomainId;
  total: number;
  correct: number;
  ms: number;
  ts: number;
  scaled?: number; // exam simulation scaled score 0..1000
  passed?: boolean;
}

export interface Settings {
  examDate?: string; // YYYY-MM-DD
  name?: string;
  sound: boolean;
  haptics: boolean;
  dailyGoal: number;
}

export interface AppState {
  version: number;
  xp: number;
  attempts: Attempt[];
  sessions: SessionSummary[];
  cards: Record<string, CardState>;
  customCards: Flashcard[];
  studyDays: Record<string, number>; // YYYY-MM-DD -> items studied
  badges: Record<string, number>; // badge id -> unlocked ts
  settings: Settings;
}
