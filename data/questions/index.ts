import type { Question } from "@/lib/types";
import type { DomainId } from "@/lib/domains";
import d1 from "./domain-1";
import d2 from "./domain-2";
import d3 from "./domain-3";
import d4 from "./domain-4";
import d5 from "./domain-5";
import d6 from "./domain-6";
import d7 from "./domain-7";
import d8 from "./domain-8";

/** Bump when you add or change questions. Shown in Settings. */
export const QUESTION_BANK_VERSION = "2026.11.2";

import { byTrack } from "@/lib/track";
import { CTFL_QUESTIONS_BY_DOMAIN, PTMC_QUESTIONS_BY_DOMAIN } from "@/data/istqb";
import { CCSK_QA } from "@/data/ccsk/questions-a";
import { CCSK_QB } from "@/data/ccsk/questions-b";

export const CISSP_QUESTIONS_BY_DOMAIN: Record<DomainId, Question[]> = { 1: d1, 2: d2, 3: d3, 4: d4, 5: d5, 6: d6, 7: d7, 8: d8 };
export const CCSK_QUESTIONS_BY_DOMAIN: Record<DomainId, Question[]> = { ...CCSK_QA, ...CCSK_QB };
export { CTFL_QUESTIONS_BY_DOMAIN, PTMC_QUESTIONS_BY_DOMAIN };
/** Question bank of the active study track. */
export const QUESTIONS_BY_DOMAIN: Record<DomainId, Question[]> = byTrack({ cissp: CISSP_QUESTIONS_BY_DOMAIN, ccsk: CCSK_QUESTIONS_BY_DOMAIN, ctfl: CTFL_QUESTIONS_BY_DOMAIN, ptmc: PTMC_QUESTIONS_BY_DOMAIN });
export const QUESTIONS: Question[] = Object.values(QUESTIONS_BY_DOMAIN).flat();
export const QUESTION_MAP = new Map(QUESTIONS.map((q) => [q.id, q]));
