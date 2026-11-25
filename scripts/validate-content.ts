/**
 * Content integrity checks — run with `npm run validate`.
 * Fails (exit 1) if any question is missing study references or any data is malformed.
 */
import { QUESTIONS } from "../data/questions";
import { FLASHCARDS } from "../data/flashcards";
import { OBJECTIVES, QUESTION_REFS, REFS } from "../data/references";
import { CCSK_QUESTIONS_BY_DOMAIN } from "../data/questions";
import { CCSK_FLASHCARDS } from "../data/ccsk/flashcards";
import { CCSK_OBJECTIVES } from "../data/ccsk/outline";
import { CCSK_MINDMAPS, CCSK_MNEMONICS } from "../data/ccsk/memory";
import { CTFL_FLASHCARDS, CTFL_MINDMAPS, CTFL_MNEMONICS, CTFL_QUESTIONS_BY_DOMAIN, PTMC_FLASHCARDS, PTMC_MINDMAPS, PTMC_MNEMONICS, PTMC_QUESTIONS_BY_DOMAIN } from "../data/istqb";
import { CTFL_LOS } from "../data/istqb/ctfl-outline";
import { PTMC_LOS } from "../data/istqb/ptmc";
import { TRACKS } from "../lib/track";

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

// ---- CCSK v5 track ----
const ccsk = Object.values(CCSK_QUESTIONS_BY_DOMAIN).flat();
const ccskIds = new Set<string>();
const answerSpread = [0, 0, 0, 0];
for (const q of ccsk) {
  if (ccskIds.has(q.id)) errors.push(`duplicate CCSK question id ${q.id}`);
  ccskIds.add(q.id);
  if (q.options.length !== 4 || new Set(q.options).size !== 4) errors.push(`${q.id}: needs 4 distinct options`);
  if (!CCSK_OBJECTIVES[q.subObjective]) errors.push(`${q.id}: unknown CCSK topic ${q.subObjective}`);
  if (!q.subObjective.startsWith(`${q.domain}.`)) errors.push(`${q.id}: topic ${q.subObjective} not in domain ${q.domain}`);
  const titles = q.references.map((r) => r.title).join(" | ");
  if (!titles.includes("Official Study Guide")) errors.push(`${q.id}: missing CCSK Study Guide citation`);
  if (!titles.includes("Security Guidance")) errors.push(`${q.id}: missing Security Guidance v5 citation`);
  if (!new RegExp(`\\b${"ABCD"[q.answerIndex]} is correct`).test(q.rationale)) errors.push(`${q.id}: rationale doesn't name the correct letter`);
  answerSpread[q.answerIndex]++;
}
for (let d = 1; d <= 12; d++) {
  if ((CCSK_QUESTIONS_BY_DOMAIN[d]?.length ?? 0) < 8) errors.push(`CCSK domain ${d}: fewer than 8 questions`);
  if (!CCSK_MINDMAPS[d]?.length) errors.push(`CCSK domain ${d}: no mind map`);
}
const kc = new Set<string>();
for (const c of CCSK_FLASHCARDS) {
  if (kc.has(c.id)) errors.push(`duplicate CCSK card ${c.id}`);
  kc.add(c.id);
}
console.log(`CCSK v5: ${ccsk.length} questions (answer spread ${answerSpread.join("/")}) · ${CCSK_FLASHCARDS.length} flashcards · ${CCSK_MNEMONICS.length} memory hooks`);

// ---- ISTQB CTFL v4.0.1 and AT*SQA Performance Testing micro-credential tracks ----
const istqb = [
  { name: "CTFL v4.0.1", bank: CTFL_QUESTIONS_BY_DOMAIN, los: CTFL_LOS, cards: CTFL_FLASHCARDS, mn: CTFL_MNEMONICS, maps: CTFL_MINDMAPS, track: TRACKS.ctfl, doc: "ISTQB Certified Tester Foundation Level Syllabus v4.0.1", pages: [14, 61] },
  { name: "Performance µ-credential", bank: PTMC_QUESTIONS_BY_DOMAIN, los: PTMC_LOS, cards: PTMC_FLASHCARDS, mn: PTMC_MNEMONICS, maps: PTMC_MINDMAPS, track: TRACKS.ptmc, doc: "AT*SQA Performance Testing Micro-Credential Body of Knowledge", pages: [6, 19] },
];
for (const t of istqb) {
  const all = Object.values(t.bank).flat();
  const seen = new Set<string>();
  const spread = [0, 0, 0, 0];
  const byLo = new Map<string, number>();
  for (const q of all) {
    if (seen.has(q.id)) errors.push(`${t.name}: duplicate id ${q.id}`);
    seen.add(q.id);
    if (q.options.length !== 4 || new Set(q.options).size !== 4) errors.push(`${q.id}: needs 4 distinct options`);
    const lo = t.los.find((l) => l.id === q.subObjective);
    if (!lo) errors.push(`${q.id}: unknown learning objective ${q.subObjective}`);
    else if (q.k !== lo.k) errors.push(`${q.id}: K-level mismatch`);
    const letter = "ABCD"[q.answerIndex];
    if (!new RegExp(`^${letter} is correct`).test(q.rationale)) errors.push(`${q.id}: rationale doesn't open with "${letter} is correct"`);
    // bare capital A–D must only ever name an option (the builder swaps them when rotating answers)
    for (const m of q.rationale.matchAll(/\b([A-D]) (test|single|defect|tester|risk|user|team|state|new|small|good|full|higher|decision|minimized|system|common|typical|failure|review|key|stakeholder|few|lot|large|well|clear|simple|component|developer|report)\b/g)) {
      errors.push(`${q.id}: "${m[0]}" reads as an article; the answer rotation would rewrite it`);
    }
    const prim = q.references[0];
    const pm = prim?.title.match(/, pp?\. (\d+)(?:–(\d+))?$/);
    if (!prim?.title.startsWith(t.doc) || !pm) errors.push(`${q.id}: first reference must cite ${t.doc} with a page`);
    else for (const g of [pm[1], pm[2]].filter(Boolean).map(Number)) if (g < t.pages[0] || g > t.pages[1]) errors.push(`${q.id}: page ${g} outside ${t.pages.join("–")}`);
    if (!prim?.url?.includes(`#page=${pm?.[1]}`)) errors.push(`${q.id}: page link doesn't open the cited page`);
    for (const r of q.references) if (r.url && !r.url.startsWith("https://")) errors.push(`${q.id}: non-https reference`);
    spread[q.answerIndex]++;
    byLo.set(q.subObjective, (byLo.get(q.subObjective) ?? 0) + 1);
  }
  for (const lo of t.los) if (!byLo.get(lo.id)) errors.push(`${t.name}: no question for ${lo.id}`);
  // the official blueprint must be fillable at the right K-level, with a distinct LO per question where possible
  for (const b of t.track.exam.blueprint ?? []) {
    const pool = (t.bank[b.domain] ?? []).filter((q) => q.k === b.k);
    if (pool.length < b.n) errors.push(`${t.name}: blueprint domain ${b.domain} K${b.k} needs ${b.n}, bank has ${pool.length}`);
  }
  const bp = (t.track.exam.blueprint ?? []).reduce((n, b) => n + b.n, 0);
  if (bp !== t.track.exam.items) errors.push(`${t.name}: blueprint totals ${bp}, exam has ${t.track.exam.items}`);
  for (const d of Object.keys(t.bank)) if (!t.maps[Number(d)]?.length) errors.push(`${t.name}: domain ${d} has no mind map`);
  const cid = new Set<string>();
  for (const c of t.cards) {
    if (cid.has(c.id)) errors.push(`${t.name}: duplicate card ${c.id}`);
    cid.add(c.id);
  }
  const k = [1, 2, 3].map((x) => all.filter((q) => q.k === x).length);
  console.log(`${t.name}: ${all.length} questions (K1 ${k[0]} · K2 ${k[1]} · K3 ${k[2]}; answer spread ${spread.join("/")}) · ${t.cards.length} flashcards · ${t.mn.length} memory hooks · ${t.los.length} LOs all covered`);
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
