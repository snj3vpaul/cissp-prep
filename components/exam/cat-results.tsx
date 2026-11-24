"use client";

import { useMemo } from "react";
import type { Difficulty } from "@/lib/types";
import { DOMAINS, type DomainId } from "@/lib/domains";
import { PASS_SCALED, bandScaled, toScaled, trajectory } from "@/lib/cat";

interface Item {
  difficulty: Difficulty;
  correct: boolean;
  domain: DomainId;
}

const W = 640;
const H = 240;
const PAD = { l: 40, r: 12, t: 14, b: 34 };

/** Estimated ability after every item, with its 95% band and the passing standard. */
export function ConfidenceGraph({ items }: { items: Item[] }) {
  const pts = useMemo(() => {
    const tr = trajectory(items);
    return tr.map((e, i) => ({ i, s: toScaled(e.theta), ...bandScaled(e), ok: items[i].correct }));
  }, [items]);
  if (!pts.length) return null;
  const n = pts.length;
  const x = (i: number) => PAD.l + (n === 1 ? 0.5 : i / (n - 1)) * (W - PAD.l - PAD.r);
  const y = (s: number) => PAD.t + (1 - s / 1000) * (H - PAD.t - PAD.b);
  const band = `M${pts.map((p) => `${x(p.i)},${y(p.hi)}`).join(" L")} L${[...pts].reverse().map((p) => `${x(p.i)},${y(p.lo)}`).join(" L")} Z`;
  const line = `M${pts.map((p) => `${x(p.i)},${y(p.s)}`).join(" L")}`;
  const last = pts[n - 1];
  const ticks = [0, 250, 500, 700, 1000];
  const xticks = Array.from(new Set([0, Math.round((n - 1) / 2), n - 1]));

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Ability estimate over ${n} items, ending at ${last.s} (95% range ${last.lo} to ${last.hi}).`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={t === PASS_SCALED ? "stroke-foreground/60" : "stroke-border"} strokeDasharray={t === PASS_SCALED ? "5 4" : undefined} />
            <text x={PAD.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" className="fill-muted-foreground">
              {t}
            </text>
          </g>
        ))}
        <text x={W - PAD.r} y={y(PASS_SCALED) - 5} textAnchor="end" fontSize="10" className="fill-foreground">
          Passing standard
        </text>
        <path d={band} className="fill-sky-500/15" />
        <path d={line} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p) => (
          <rect key={p.i} x={x(p.i) - 1.5} y={H - PAD.b + 6} width="3" height="8" rx="1" className={p.ok ? "fill-emerald-500" : "fill-red-500"} />
        ))}
        {xticks.map((i) => (
          <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
            {i + 1}
          </text>
        ))}
        <circle cx={x(last.i)} cy={y(last.s)} r="4" className="fill-sky-600 dark:fill-sky-400" />
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="mr-1 inline-block h-0.5 w-4 bg-sky-600 align-middle" /> Estimated ability
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-4 rounded-sm bg-sky-500/20 align-middle" /> 95% band
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-1 bg-emerald-500 align-middle" />
          <span className="mr-1 inline-block h-2 w-1 bg-red-500 align-middle" /> Each item, right or wrong
        </span>
      </figcaption>
    </figure>
  );
}

/** Correct vs incorrect by domain, with how many items each domain received. */
export function DomainFeedback({ items }: { items: Item[] }) {
  const rows = DOMAINS.map((d) => {
    const mine = items.filter((i) => i.domain === d.id);
    const c = mine.filter((i) => i.correct).length;
    return { d, n: mine.length, c };
  });
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <ul className="space-y-2.5">
      {rows.map(({ d, n, c }) => (
        <li key={d.id} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm">
          <span className="truncate">
            <span className="text-muted-foreground">D{d.id}</span> {d.short}
          </span>
          <span className="flex h-3 overflow-hidden rounded-full bg-muted" style={{ width: `${(n / max) * 100}%`, minWidth: n ? 8 : 0 }} aria-hidden>
            <span className="h-full" style={{ width: `${n ? (c / n) * 100 : 0}%`, background: d.color }} />
            <span className="h-full flex-1 bg-red-500/45" />
          </span>
          <span className="text-right text-xs tabular-nums text-muted-foreground">{n ? `${c}/${n} · ${Math.round((c / n) * 100)}%` : "—"}</span>
        </li>
      ))}
    </ul>
  );
}
