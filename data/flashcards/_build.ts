import type { Flashcard } from "@/lib/types";

/**
 * Compact authoring row: [front, back, mnemonic?]
 * IDs are positional (d1-c001 …) — APPEND new cards to the end of a file to keep review history stable.
 * SM-2 fields start at defaults; real scheduling state is stored per-user in localStorage.
 */
export type CRow = [string, string, string?];

const SEED_DUE = "2024-04-15";

export function buildCards(domain: number, rows: CRow[]): Flashcard[] {
  return rows.map(([front, back, mnemonic], i) => ({
    id: `d${domain}-c${String(i + 1).padStart(3, "0")}`,
    domain,
    front,
    back,
    mnemonic,
    interval: 0,
    easeFactor: 2.5,
    dueDate: SEED_DUE,
  }));
}
