import { addDays, todayISO } from "@/lib/sm2";

/** Current streak counts today if studied, otherwise continues from yesterday (so it doesn't break until the day is over). */
export function computeStreak(days: Record<string, number>) {
  const has = (d: string) => (days[d] ?? 0) > 0;
  const today = todayISO();
  let cursor = has(today) ? today : addDays(today, -1);
  let current = 0;
  while (has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = Object.keys(days).filter(has).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best: Math.max(best, current), studiedToday: has(today) };
}
