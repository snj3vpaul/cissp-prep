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
export const QUESTION_BANK_VERSION = "2026.11.1";

export const QUESTIONS_BY_DOMAIN: Record<DomainId, Question[]> = { 1: d1, 2: d2, 3: d3, 4: d4, 5: d5, 6: d6, 7: d7, 8: d8 };
export const QUESTIONS: Question[] = Object.values(QUESTIONS_BY_DOMAIN).flat();
export const QUESTION_MAP = new Map(QUESTIONS.map((q) => [q.id, q]));
