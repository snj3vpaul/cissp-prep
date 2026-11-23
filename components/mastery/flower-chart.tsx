"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { DomainId } from "@/lib/domains";
import type { masteryModel } from "@/lib/mastery";

type Row = ReturnType<typeof masteryModel>["domains"][number];

const R = 150; // petal length at 100%
const RING = 172;
const LABEL = 214;
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const at = (deg: number, r: number) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r] as const;

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function petal(len: number) {
  const w = Math.max(14, len * 0.4);
  return `M0 0 C ${w} ${-len * 0.3}, ${w * 0.85} ${-len * 0.82}, 0 ${-len} C ${-w * 0.85} ${-len * 0.82}, ${-w} ${-len * 0.3}, 0 0 Z`;
}

/** Eight domain petals (length = mastery), a radar outline through the tips, and a colour ring. */
export function FlowerChart({ rows, active, onActive }: { rows: Row[]; active: DomainId | null; onActive: (d: DomainId | null) => void }) {
  const reduce = useReducedMotion();
  const [grown, setGrown] = useState(!!reduce);
  useEffect(() => {
    if (reduce) return;
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, [reduce]);

  const n = rows.length;
  const step = 360 / n;
  const len = (m: number) => R * (0.18 + 0.82 * (m / 100));
  const tips = rows.map((r, i) => at(i * step, len(r.mastery)));

  // Ring: short arcs blending each domain colour into the next.
  const SEG = 96;
  const ring = Array.from({ length: SEG }, (_, k) => {
    const a0 = (k / SEG) * 360 - step / 2;
    const a1 = ((k + 1) / SEG) * 360 - step / 2 + 0.4;
    const pos = (k / SEG) * n;
    const i = Math.floor(pos) % n;
    const color = mix(rows[i].domain.color, rows[(i + 1) % n].domain.color, pos - Math.floor(pos));
    const [x0, y0] = at(a0, RING);
    const [x1, y1] = at(a1, RING);
    return <path key={k} d={`M${x0} ${y0} A${RING} ${RING} 0 0 1 ${x1} ${y1}`} stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  });

  return (
    <svg viewBox="-305 -255 610 510" className="h-auto w-full max-w-[600px] overflow-visible" role="img" aria-label="Domain mastery chart">
      <defs>
        {rows.map((r) => (
          <linearGradient key={r.domain.id} id={`pg-${r.domain.id}`} x1="0" y1="0" x2="0" y2={-R} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={r.domain.color} stopOpacity="0.08" />
            <stop offset="1" stopColor={r.domain.color} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>

      {/* guides */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle key={f} r={R * (0.18 + 0.82 * f)} fill="none" className="stroke-border" strokeWidth="1" strokeDasharray={f === 1 ? undefined : "2 5"} />
      ))}
      {Array.from({ length: 120 }, (_, k) => {
        const [x0, y0] = at(k * 3, RING + 8);
        const [x1, y1] = at(k * 3, RING + (k % 5 === 0 ? 14 : 11));
        return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} className="stroke-muted-foreground/25" strokeWidth="1" />;
      })}
      {ring}

      {/* petals */}
      <g style={{ transform: `scale(${grown ? 1 : 0.2})`, transition: "transform 0.9s cubic-bezier(.2,1.2,.3,1)" }}>
        {rows.map((r, i) => {
          const dim = active !== null && active !== r.domain.id;
          return (
            <Link key={r.domain.id} href={`/quiz/${r.domain.slug}`} aria-label={`${r.domain.name}: ${r.mastery}% mastery. Drill this domain.`}>
              <path
                d={petal(len(r.mastery))}
                transform={`rotate(${i * step})`}
                fill={`url(#pg-${r.domain.id})`}
                stroke={r.domain.color}
                strokeOpacity={active === r.domain.id ? 0.9 : 0.35}
                strokeWidth={active === r.domain.id ? 2 : 1}
                style={{ opacity: dim ? 0.25 : 1, transition: "opacity .2s" }}
                onMouseEnter={() => onActive(r.domain.id)}
                onMouseLeave={() => onActive(null)}
                onFocus={() => onActive(r.domain.id)}
                onBlur={() => onActive(null)}
              />
            </Link>
          );
        })}
        <polygon points={tips.map((p) => p.join(",")).join(" ")} fill="none" className="stroke-foreground/40" strokeWidth="1" />
        {tips.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" className="fill-background" stroke={rows[i].domain.color} strokeWidth="2" />
        ))}
      </g>
      <circle r="24" className="fill-foreground" />
      <circle r="10" fill="none" className="stroke-background/30" strokeWidth="1" />
      <circle r="3" className="fill-background" />

      {/* labels */}
      {rows.map((r, i) => {
        const a = i * step;
        const [x, y] = at(a, LABEL);
        const [tx0, ty0] = at(a, RING + 20);
        const [tx1, ty1] = at(a, RING + 28);
        const anchor = Math.abs(x) < 20 ? "middle" : x > 0 ? "start" : "end";
        return (
          <g key={r.domain.id} style={{ opacity: active !== null && active !== r.domain.id ? 0.4 : 1, transition: "opacity .2s" }}>
            <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} className="stroke-muted-foreground/60" strokeWidth="1" />
            <text x={x} y={y - 2} textAnchor={anchor} className="fill-foreground" fontSize="14">
              {r.domain.short}
            </text>
            <text x={x} y={y + 14} textAnchor={anchor} fontSize="11" fill={r.domain.color} fontWeight={600}>
              {r.attempted ? `${r.mastery}%` : "—"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
