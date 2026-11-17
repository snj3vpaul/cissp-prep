import type { DomainId } from "@/lib/domains";
import type { Difficulty, Question } from "@/lib/types";
import { referencesFor } from "@/data/references";

/**
 * Compact authoring row:
 *   [subObjective, difficulty, stem, [A, B, C, D], answerIndex, rationale, mindsetHint?]
 *
 * AUTHORING RULES
 * 1. IDs are assigned by position (d1-q001 …). ALWAYS APPEND new rows — never insert or reorder,
 *    or learners' saved progress will point at the wrong questions.
 * 2. In the rationale, refer to options by their capital letter (A, B, C, D) as standalone words
 *    ("B is correct…", "A and D are wrong…"). Don't use a standalone capital A–D for anything else.
 * 3. Study references are attached automatically: the exam-outline objective, the Official Study
 *    Guide chapter and the objective's default sources (data/references/objectives.ts). Add
 *    question-specific citations in data/references/questions.ts, keyed by question id.
 * 4. Write options in whatever order is natural. The builder moves the correct answer to a
 *    deterministic, evenly distributed position and rewrites the letters in the rationale to match,
 *    so the answer key is never biased toward one letter.
 */
export type QRow = [string, Difficulty, string, [string, string, string, string], 0 | 1 | 2 | 3, string, string?];

const LETTERS = ["A", "B", "C", "D"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildQuestions(domain: DomainId, rows: QRow[]): Question[] {
  return rows.map(([subObjective, difficulty, stem, options, answerIndex, rationale, mindsetHint], i) => {
    const id = `d${domain}-q${String(i + 1).padStart(3, "0")}`;
    const target = hash(id) % 4;
    const opts = [...options];
    let text = rationale;
    if (target !== answerIndex) {
      [opts[target], opts[answerIndex]] = [opts[answerIndex], opts[target]];
      const a = LETTERS[answerIndex];
      const b = LETTERS[target];
      text = rationale.replace(/\b([A-D])\b/g, (m) => (m === a ? b : m === b ? a : m));
    }
    return { id, domain, subObjective, difficulty, stem, options: opts, answerIndex: target, rationale: text, mindsetHint, references: referencesFor(id, subObjective) };
  });
}
