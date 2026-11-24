import type { Flashcard } from "@/lib/types";
import c1 from "./domain-1";
import c2 from "./domain-2";
import c3 from "./domain-3";
import c4 from "./domain-4";
import c5 from "./domain-5";
import c6 from "./domain-6";
import c7 from "./domain-7";
import c8 from "./domain-8";

export const FLASHCARD_DECK_VERSION = "2026.11.1";
import { TRACK_ID } from "@/lib/track";
import { CCSK_FLASHCARDS } from "@/data/ccsk/flashcards";

export const CISSP_FLASHCARDS: Flashcard[] = [...c1, ...c2, ...c3, ...c4, ...c5, ...c6, ...c7, ...c8];
/** Flashcard deck of the active study track. */
export const FLASHCARDS: Flashcard[] = TRACK_ID === "ccsk" ? CCSK_FLASHCARDS : CISSP_FLASHCARDS;
