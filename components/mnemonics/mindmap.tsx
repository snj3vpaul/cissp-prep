"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MINDMAPS } from "@/data/mindmaps";
import { DOMAINS } from "@/lib/domains";
import { DomainWeight } from "@/components/outline/domain-label";

/**
 * Radial mindmap: domain at center, sub-objectives on an inner ring, key topics on an outer ring.
 * Pure SVG so it scales crisply to fullscreen and prints well.
 */
export function Mindmap({ domain, compact = false }: { domain: number; compact?: boolean }) {
  const reduce = useReducedMotion();
  const d = DOMAINS[domain - 1];
  const branches = MINDMAPS[domain] ?? [];
  const W = 1000;
  const H = 1000;
  const cx = W / 2;
  const cy = H / 2;
  const r1 = 255;
  const r2 = 410;
  const totalLeaves = branches.reduce((s, b) => s + b.leaves.length, 0);
  // Index of each branch's first leaf around the circle (computed up front, no mutation during render).
  const starts = branches.map((_, i) => branches.slice(0, i).reduce((s, b) => s + b.leaves.length, 0));

  const polar = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;

  return (
    <svg viewBox={compact ? `0 0 ${W} ${H}` : `-170 -30 ${W + 340} ${H + 60}`} className="h-full w-full" role="img" aria-label={`${d.name} mindmap: ${branches.map((b) => `${b.code} ${b.label} (${b.leaves.join(", ")})`).join("; ")}`}>
      <defs>
        <radialGradient id={`mm-core-${domain}`}>
          <stop offset="0%" stopColor={d.color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={d.color} stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {branches.map((b, bi) => {
        const startLeaf = starts[bi];
        const mid = ((startLeaf + b.leaves.length / 2) / totalLeaves) * Math.PI * 2 - Math.PI / 2;
        const [bx, by] = polar(r1, mid);
        return (
          <motion.g
            key={b.code}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: compact ? 0 : 0.1 + bi * 0.06, duration: 0.5 }}
          >
            <path d={`M${cx},${cy} Q${(cx + bx) / 2 + 20},${(cy + by) / 2 - 20} ${bx},${by}`} stroke={d.color} strokeOpacity="0.55" strokeWidth="3" fill="none" />
            {b.leaves.map((leaf, li) => {
              const a = ((startLeaf + li + 0.5) / totalLeaves) * Math.PI * 2 - Math.PI / 2;
              const [lx, ly] = polar(r2, a);
              const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
              const [tx, ty] = polar(r2 + 14, a);
              return (
                <g key={leaf}>
                  <path d={`M${bx},${by} L${lx},${ly}`} stroke="hsl(var(--muted-foreground))" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
                  <circle cx={lx} cy={ly} r="5" fill={d.color} />
                  {!compact && (
                    <text x={tx} y={ty} textAnchor={anchor} dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 19, fontFamily: "var(--font-geist-sans)" }}>
                      {leaf}
                    </text>
                  )}
                </g>
              );
            })}
            <g>
              <rect x={bx - 70} y={by - 26} width="140" height="52" rx="16" fill="hsl(var(--card))" stroke={d.color} strokeWidth="2" />
              <text x={bx} y={by - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 13, fontFamily: "var(--font-geist-mono)" }}>
                {b.code}
              </text>
              <text x={bx} y={by + 13} textAnchor="middle" className="fill-foreground" style={{ fontSize: b.label.length > 16 ? 14 : 16, fontWeight: 600, fontFamily: "var(--font-geist-sans)" }}>
                {b.label}
              </text>
            </g>
          </motion.g>
        );
      })}
      <circle cx={cx} cy={cy} r="110" fill="hsl(var(--card))" />
      <circle cx={cx} cy={cy} r="110" fill={`url(#mm-core-${domain})`} stroke={d.color} strokeWidth="2.5" />
      <text x={cx} y={cy - 22} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 16, fontFamily: "var(--font-geist-mono)" }}>
        DOMAIN {d.id} · <DomainWeight id={d.id} />
      </text>
      {wrap(d.name, 16).map((line, i, arr) => (
        <text key={i} x={cx} y={cy + 8 + i * 26 - ((arr.length - 1) * 26) / 2 + 10} textAnchor="middle" className="fill-foreground" style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk Variable', sans-serif" }}>
          {line}
        </text>
      ))}
    </svg>
  );
}

function wrap(s: string, max: number) {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
