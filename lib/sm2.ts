import type { CardState } from "@/lib/types";

/** Review grades mapped to SM-2 quality scores. */
export type Grade = "again" | "hard" | "good" | "easy";
const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export const todayISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return todayISO(new Date(y, m - 1, d + days));
};

export const newCardState = (): CardState => ({
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  dueDate: todayISO(),
  lapses: 0,
});

/**
 * SuperMemo-2 (Wozniak, 1987) with Anki-style "easy" bonus and "hard" dampening.
 * q < 3 resets repetitions; EF' = EF + (0.1 - (5-q)(0.08 + (5-q)0.02)), floor 1.3.
 */
export function review(state: CardState, grade: Grade, now = new Date()): CardState {
  const q = QUALITY[grade];
  let { interval, easeFactor, repetitions, lapses } = state;

  if (q < 3) {
    repetitions = 0;
    interval = 0; // see again today
    lapses += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = grade === "easy" ? 4 : 1;
    else if (repetitions === 2) interval = grade === "easy" ? 8 : grade === "hard" ? 3 : 6;
    else {
      const mult = grade === "hard" ? 1.2 : grade === "easy" ? easeFactor * 1.3 : easeFactor;
      interval = Math.max(interval + 1, Math.round(interval * mult));
    }
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  const today = todayISO(now);
  return { interval, easeFactor: Number(easeFactor.toFixed(3)), repetitions, lapses, dueDate: addDays(today, interval), lastReviewed: today };
}

/** Human preview of the next interval for each grade button. */
export function previewIntervals(state: CardState): Record<Grade, string> {
  const fmt = (d: number) => (d === 0 ? "<10m" : d < 30 ? `${d}d` : d < 365 ? `${Math.round(d / 30)}mo` : `${(d / 365).toFixed(1)}y`);
  return {
    again: fmt(review(state, "again").interval),
    hard: fmt(review(state, "hard").interval),
    good: fmt(review(state, "good").interval),
    easy: fmt(review(state, "easy").interval),
  };
}
