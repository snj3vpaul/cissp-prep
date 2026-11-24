import type { Difficulty, Flashcard, Question, Reference } from "@/lib/types";
import { CCSK_DOMAINS } from "@/lib/domains";
import { CCSK_OBJECTIVES, CCSK_SOURCES, type CcskExtraRef } from "@/data/ccsk/outline";

/**
 * CCSK authoring rows. Same rules as the CISSP bank: append only (IDs are positional),
 * refer to options by capital letter in the rationale, and the builder rotates the correct
 * answer to an evenly distributed position.
 *   [topic, difficulty, stem, [A, B, C, D], answerIndex, rationale, hint?, extraRefs?]
 */
export type KRow = [string, Difficulty, string, [string, string, string, string], 0 | 1 | 2 | 3, string, string?, CcskExtraRef[]?];
export type KCard = [string, string, string?];

const LETTERS = ["A", "B", "C", "D"];
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ccskRefs(domain: number, topic: string, extra: CcskExtraRef[] = []): Reference[] {
  const d = CCSK_DOMAINS[domain - 1];
  return [
    { ...CCSK_SOURCES.studyGuide, title: `${CCSK_SOURCES.studyGuide.title} — Domain ${domain}: ${d.name}` },
    { ...CCSK_SOURCES.guidance, title: `${CCSK_SOURCES.guidance.title} — Domain ${domain}, ${CCSK_OBJECTIVES[topic] ?? d.name}` },
    ...extra.map((k) => CCSK_SOURCES.extra[k]),
  ];
}

export function buildCcskQuestions(domain: number, rows: KRow[]): Question[] {
  return rows.map(([topic, difficulty, stem, options, answerIndex, rationale, mindsetHint, extra], i) => {
    const id = `k${domain}-q${String(i + 1).padStart(3, "0")}`;
    const target = hash(id) % 4;
    const opts = [...options];
    let text = rationale;
    if (target !== answerIndex) {
      [opts[target], opts[answerIndex]] = [opts[answerIndex], opts[target]];
      const a = LETTERS[answerIndex];
      const b = LETTERS[target];
      text = rationale.replace(/\b([A-D])\b/g, (m) => (m === a ? b : m === b ? a : m));
    }
    return { id, domain, subObjective: topic, difficulty, stem, options: opts, answerIndex: target, rationale: text, mindsetHint, references: ccskRefs(domain, topic, extra) };
  });
}

export function buildCcskCards(domain: number, rows: KCard[]): Flashcard[] {
  return rows.map(([front, back, mnemonic], i) => ({
    id: `k${domain}-c${String(i + 1).padStart(3, "0")}`,
    domain,
    front,
    back,
    mnemonic,
    interval: 0,
    easeFactor: 2.5,
    dueDate: "2024-07-15",
  }));
}
