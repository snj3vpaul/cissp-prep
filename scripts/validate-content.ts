/**
 * Content integrity checks — run with `npm run validate`.
 * Fails (exit 1) if any question is missing study references or any data is malformed.
 */
import { QUESTIONS } from "../data/questions";
import { FLASHCARDS } from "../data/flashcards";
import { OBJECTIVES, QUESTION_REFS, REFS } from "../data/references";

const errors: string[] = [];
const ids = new Set(QUESTIONS.map((q) => q.id));

for (const q of QUESTIONS) {
  if (q.options.length !== 4) errors.push(`${q.id}: needs exactly 4 options`);
  if (q.answerIndex < 0 || q.answerIndex > 3) errors.push(`${q.id}: answerIndex out of range`);
  if (!OBJECTIVES[q.subObjective]) errors.push(`${q.id}: unknown sub-objective ${q.subObjective}`);
  if (!q.subObjective.startsWith(`${q.domain}.`)) errors.push(`${q.id}: sub-objective ${q.subObjective} not in domain ${q.domain}`);
  const kinds = q.references.map((r) => r.kind);
  if (!kinds.includes("outline")) errors.push(`${q.id}: missing exam-outline reference`);
  if (!kinds.includes("book")) errors.push(`${q.id}: missing Official Study Guide reference`);
  if (q.references.filter((r) => r.kind !== "outline" && r.kind !== "book").length < 1) errors.push(`${q.id}: needs at least one authoritative source`);
  for (const r of q.references) if (r.url && !r.url.startsWith("https://")) errors.push(`${q.id}: non-https reference ${r.url}`);
}

for (const id of Object.keys(QUESTION_REFS)) if (!ids.has(id)) errors.push(`questions.ts references unknown question ${id}`);
for (const [k, r] of Object.entries(REFS)) if ("url" in r && r.url && !r.url.startsWith("https://")) errors.push(`library ${k}: non-https URL`);

const cardIds = new Set<string>();
for (const c of FLASHCARDS) {
  if (cardIds.has(c.id)) errors.push(`duplicate flashcard id ${c.id}`);
  cardIds.add(c.id);
  if (!c.front.trim() || !c.back.trim()) errors.push(`${c.id}: empty side`);
}

const used = new Set(QUESTIONS.flatMap((q) => q.references.map((r) => r.key).filter(Boolean)));
const unused = Object.keys(REFS).filter((k) => !used.has(k));

console.log(`Questions: ${QUESTIONS.length} · Flashcards: ${FLASHCARDS.length} · Library sources: ${Object.keys(REFS).length} (${unused.length} not yet cited)`);
console.log(`Questions with question-specific citations: ${Object.keys(QUESTION_REFS).length}/${QUESTIONS.length}`);
const avg = QUESTIONS.reduce((s, q) => s + q.references.length, 0) / QUESTIONS.length;
console.log(`Average references per question: ${avg.toFixed(1)}`);
if (unused.length) console.log(`Uncited library entries: ${unused.join(", ")}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("✓ All content checks passed");
