import type { DomainId, OutlinePref } from "@/lib/domains";

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

export type QuizMode = "quick" | "domain" | "timed" | "exam" | "missed" | "check";

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
  level?: number; // knowledge-check effort level (0 Low … 4 Galaxy)
  cat?: "full" | "mini"; // computerized adaptive test variant
  traj?: number[]; // CAT: scaled ability estimate after each item
  /** Logged from an outside practice platform rather than taken here. */
  source?: "quantumexams";
  external?: { ability?: string; domains?: Partial<Record<DomainId, number>>; notes?: string };
}

export interface Settings {
  examDate?: string; // YYYY-MM-DD
  name?: string;
  sound: boolean;
  haptics: boolean;
  dailyGoal: number;
  /** Which exam outline to study against; "auto" follows the exam date. */
  outline?: OutlinePref;
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
  /** Flashcard recall per day (YYYY-MM-DD): reviews and how many were recalled (not "again"). */
  memoryDays?: Record<string, { n: number; recalled: number }>;
  /** Cipher-core collectibles: permanent grants and the qualifying events already processed. */
  cores?: { grants: { creature: string; colorway: 0 | 1; ts: number; source: string; score: number }[]; processed: string[]; seen?: number };
  settings: Settings;
}
