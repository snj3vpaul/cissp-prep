import type { Reference } from "@/lib/types";
import { REFS, type RefKey } from "./library";
import { OBJECTIVES, OSG } from "./objectives";
import { QUESTION_REFS } from "./questions";
import { OBJECTIVES_2027 } from "@/data/outline-2027";
import { activeOutline } from "@/lib/domains";

const OUTLINE_URL = "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline";
const MAX_SOURCES = 4;

/**
 * Every question cites, in order:
 *   1. its ISC2 exam-outline objective,
 *   2. the matching Official Study Guide chapter(s),
 *   3. question-specific sources, then the objective's default sources (deduplicated, max 4).
 */
export function referencesFor(questionId: string, subObjective: string): Reference[] {
  const obj = OBJECTIVES[subObjective];
  const out: Reference[] = [];
  if (obj) {
    // Title is resolved against the active outline at render time (outlineRef); key carries the objective.
    out.push({ kind: "outline", title: `CISSP Exam Outline ${subObjective} — ${obj.title}`, publisher: "ISC2 (effective 15 April 2024)", url: OUTLINE_URL, key: `outline:${subObjective}` });
    for (const ch of obj.osg) {
      out.push({ kind: "book", title: `Chapter ${ch}: ${OSG.chapters[ch]}`, publisher: OSG.edition });
    }
  }
  const keys = [...new Set<RefKey>([...(QUESTION_REFS[questionId] ?? []), ...(obj?.refs ?? [])])].slice(0, MAX_SOURCES);
  for (const k of keys) {
    const r = REFS[k];
    out.push({ kind: r.kind, title: r.title, publisher: r.publisher, url: "url" in r ? r.url : undefined, key: k });
  }
  return out;
}

/** Outline citation for the active outline (2024 or 2027); objective numbering is the same in both. */
export function outlineRef(r: Reference): Reference {
  if (r.kind !== "outline" || !r.key?.startsWith("outline:")) return r;
  const sub = r.key.slice(8);
  const o = activeOutline();
  const title = o.id === "2027" ? OBJECTIVES_2027[sub]?.title : OBJECTIVES[sub]?.title;
  return title ? { ...r, title: `CISSP Exam Outline ${sub} — ${title}`, publisher: `ISC2 (effective ${o.effectiveLabel})` } : r;
}

export { REFS, OBJECTIVES, OSG, QUESTION_REFS };
