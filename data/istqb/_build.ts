import type { Difficulty, Flashcard, Question, Reference } from "@/lib/types";

/**
 * Authoring rows for the ISTQB CTFL and AT*SQA Performance Testing banks. Same rules as the CCSK
 * bank: append only (IDs are positional), refer to options by capital letter in the rationale
 * ("B is correct: …"), never use a bare capital A–D for anything else, and the builder rotates the
 * correct answer to an evenly distributed position.
 *
 *   [learningObjective, difficulty, stem, [A, B, C, D], answerIndex, rationale, page(s), extra refs?]
 *
 * `page` is the page of the syllabus where the answer is stated, not just where the section starts.
 */
export type IRow = [string, Difficulty, string, [string, string, string, string], 0 | 1 | 2 | 3, string, number | [number, number], Reference[]?];
export type ICard = [string, string, string?];

const LETTERS = ["A", "B", "C", "D"];
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface BankSpec {
  prefix: string; // id prefix, e.g. "t" → t4-q007
  /** Domain/chapter of a learning objective. */
  domainOf: (lo: string) => number;
  kOf: (lo: string) => 1 | 2 | 3 | 4;
  /** Primary citation for the answer: syllabus section + exact page. */
  cite: (lo: string, page: number | [number, number]) => Reference[];
}

export function buildBank(spec: BankSpec, rows: IRow[]): Record<number, Question[]> {
  const out: Record<number, Question[]> = {};
  const seq: Record<number, number> = {};
  for (const [lo, difficulty, stem, options, answerIndex, rationale, page, extra] of rows) {
    const domain = spec.domainOf(lo);
    seq[domain] = (seq[domain] ?? 0) + 1;
    const id = `${spec.prefix}${domain}-q${String(seq[domain]).padStart(3, "0")}`;
    const target = hash(id) % 4;
    const opts = [...options];
    let text = rationale;
    if (target !== answerIndex) {
      [opts[target], opts[answerIndex]] = [opts[answerIndex], opts[target]];
      const a = LETTERS[answerIndex];
      const b = LETTERS[target];
      text = rationale.replace(/\b([A-D])\b/g, (m) => (m === a ? b : m === b ? a : m));
    }
    (out[domain] ??= []).push({
      id,
      domain,
      subObjective: lo,
      difficulty,
      k: spec.kOf(lo),
      stem,
      options: opts,
      answerIndex: target,
      rationale: text,
      references: [...spec.cite(lo, page), ...(extra ?? [])],
    });
  }
  return out;
}

export function buildCards(prefix: string, rows: Record<number, ICard[]>): Flashcard[] {
  return Object.entries(rows).flatMap(([d, list]) =>
    list.map(([front, back, mnemonic], i) => ({
      id: `${prefix}${d}-c${String(i + 1).padStart(3, "0")}`,
      domain: Number(d),
      front,
      back,
      mnemonic,
      interval: 0,
      easeFactor: 2.5,
      dueDate: "2024-09-15",
    }))
  );
}
