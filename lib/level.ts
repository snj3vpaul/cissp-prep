/** XP curve: level n requires 100·n^1.5 cumulative-ish XP. */
export function levelFromXp(xp: number) {
  let level = 1;
  let need = 150;
  let floor = 0;
  while (xp >= floor + need) {
    floor += need;
    level++;
    need = Math.round(150 * Math.pow(level, 1.35));
  }
  const ranks = ["Recruit", "Analyst", "Engineer", "Architect", "Manager", "Director", "CISO"];
  return { level, into: xp - floor, need, pct: Math.round(((xp - floor) / need) * 100), rank: ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 3))] };
}
