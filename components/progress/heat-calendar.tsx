"use client";

import { useState } from "react";
import { todayISO } from "@/lib/sm2";

/** GitHub-style activity calendar for the last `weeks` weeks — single-hue sequential scale. */
export function HeatCalendar({ days, weeks = 26 }: { days: Record<string, number>; weeks?: number }) {
  const [hover, setHover] = useState<{ date: string; n: number } | null>(null);
  const today = new Date();
  // Start on the Sunday (weeks-1) weeks ago so each column is one Sun–Sat week.
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - (weeks - 1) * 7);
  const cells: { date: string; n: number; future: boolean }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = todayISO(dt);
    cells.push({ date: key, n: days[key] ?? 0, future: dt > today });
  }
  const max = Math.max(10, ...cells.map((c) => c.n));
  const level = (n: number) => (n === 0 ? 0 : n < max * 0.25 ? 1 : n < max * 0.5 ? 2 : n < max * 0.75 ? 3 : 4);
  const shades = ["hsl(var(--muted))", "#c4b5fd66", "#a78bfa99", "#8b5cf6cc", "#7c3aed"];
  const cols = Math.ceil(cells.length / 7);
  const active = cells.filter((c) => c.n > 0).length;

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div
          className="grid w-max grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 13px)", gridTemplateColumns: `repeat(${cols}, 13px)` }}
          role="img"
          aria-label={`Study activity: ${active} active days in the last ${weeks} weeks`}
          onMouseLeave={() => setHover(null)}
        >
          {cells.map((c) => (
            <span
              key={c.date}
              onMouseEnter={() => setHover({ date: c.date, n: c.n })}
              className="h-[13px] w-[13px] rounded-[3px]"
              style={{ background: c.future ? "transparent" : shades[level(c.n)] }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span aria-live="polite">{hover ? `${new Date(hover.date + "T12:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}: ${hover.n} items` : `${active} active days`}</span>
        <span className="flex items-center gap-1">
          Less
          {shades.map((s, i) => (
            <span key={i} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: s }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
