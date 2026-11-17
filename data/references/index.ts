import type { Reference } from "@/lib/types";
import { REFS, type RefKey } from "./library";
import { OBJECTIVES, OSG } from "./objectives";
import { QUESTION_REFS } from "./questions";

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
    out.push({ kind: "outline", title: `CISSP Exam Outline ${subObjective} — ${obj.title}`, publisher: "ISC2 (effective 15 April 2024)", url: OUTLINE_URL });
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

export { REFS, OBJECTIVES, OSG, QUESTION_REFS };
