"use client";

import { useId } from "react";
import { CREATURE, type Colorway } from "@/lib/collection";
import { ART } from "@/components/collection/creature-art";
import { cn } from "@/lib/utils";

const C = { x: 100, y: 112, r: 54, hub: 20 };
const polar = (deg: number, r: number) => [C.x + r * Math.cos((deg * Math.PI) / 180), C.y + r * Math.sin((deg * Math.PI) / 180)].map((n) => n.toFixed(2)).join(" ");
const PLATES = [
  { a0: -90, a1: 0, dx: 70, dy: -70, r: 50 },
  { a0: 0, a1: 90, dx: 75, dy: 60, r: -40 },
  { a0: 90, a1: 180, dx: -75, dy: 60, r: 40 },
  { a0: 180, a1: 270, dx: -70, dy: -70, r: -50 },
];
const plateD = (a0: number, a1: number) =>
  `M${polar(a0 + 3, C.r)} A${C.r} ${C.r} 0 0 1 ${polar(a1 - 3, C.r)} L${polar(a1 - 5, C.hub + 4)} A${C.hub + 4} ${C.hub + 4} 0 0 0 ${polar(a0 + 5, C.hub + 4)} Z`;

const SILHOUETTE: Colorway = { name: "?", body: "#3a3a44", shade: "#30303a", belly: "#3a3a44", accent: "#30303a", eye: "#3a3a44" };

function Shell({ cw, locked, className }: { cw: Colorway; locked?: boolean; className?: string }) {
  const plate = locked ? "#d4d4da" : cw.body;
  const seam = locked ? "#b9b9c2" : cw.accent;
  return (
    <g className={className}>
      <circle className="core-base" cx={C.x} cy={C.y} r={C.r + 3} fill={locked ? "#c4c4cc" : cw.shade} />
      {PLATES.map((p, i) => (
        <path
          key={i}
          className="core-plate"
          d={plateD(p.a0, p.a1)}
          fill={plate}
          stroke={seam}
          strokeWidth="2.5"
          style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--r": `${p.r}deg` } as React.CSSProperties}
        />
      ))}
      <g className="core-hub">
        <circle cx={C.x} cy={C.y} r={C.hub} fill={locked ? "#e7e7ec" : cw.shade} stroke={seam} strokeWidth="3" />
        {locked ? (
          <text x={C.x} y={C.y + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#8c8c96">
            ?
          </text>
        ) : (
          <>
            <circle cx={C.x} cy={C.y - 4} r="5" fill={cw.accent} />
            <polygon points={`${C.x - 3},${C.y} ${C.x + 3},${C.y} ${C.x + 2},${C.y + 9} ${C.x - 2},${C.y + 9}`} fill={cw.accent} />
          </>
        )}
      </g>
      <ellipse className="core-base" cx={C.x - 18} cy={C.y - 26} rx="16" ry="9" fill="#fff" opacity="0.28" transform={`rotate(-30 ${C.x - 18} ${C.y - 26})`} />
    </g>
  );
}

/**
 * One collectible on a stage.
 *  - static: the creature (or a sealed shell when locked), no motion
 *  - reveal: the shell spins, cracks and unfolds into one colourway (~5 s, then idles)
 *  - showcase: the full 11-second sequence, unfolding into the first colourway and
 *    switching to the second (shown as a dark silhouette until it is unlocked)
 */
export function CoreStage({
  creature,
  colorway = 0,
  mode = "static",
  locked = false,
  altUnlocked = false,
  className,
}: {
  creature: string;
  colorway?: 0 | 1;
  mode?: "static" | "reveal" | "showcase";
  locked?: boolean;
  altUnlocked?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const hl = `hl-${uid}`;
  const c = CREATURE[creature];
  const art = ART[creature];
  const cwA = c.colorways[mode === "showcase" ? 0 : colorway];
  const animated = mode !== "static";

  return (
    <svg viewBox="0 0 200 200" className={cn("h-full w-full", animated && `core-${mode}`, className)} role="img" aria-label={locked ? "Sealed cipher core" : `${c.name}, ${cwA.name} colourway`}>
      <defs>
        <radialGradient id={hl} cx="32%" cy="26%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="176" rx="54" ry="8" fill="#000" opacity="0.18" />
      {locked ? (
        <Shell cw={cwA} locked />
      ) : (
        <>
          {animated && <circle className="core-flash" cx="100" cy="112" r="40" fill="none" stroke={cwA.accent} strokeWidth="6" />}
          <g className={cn("cr", animated && (mode === "showcase" ? "cr-a-swap" : "cr-in"))}>
            <g className={animated ? "cr-bob" : undefined}>{art(cwA, hl)}</g>
          </g>
          {mode === "showcase" && (
            <>
              <circle className="core-flash-2" cx="100" cy="112" r="40" fill="none" stroke={c.colorways[1].accent} strokeWidth="6" />
              <g className="cr cr-b-swap">
                <g className="cr-bob">{art(altUnlocked ? c.colorways[1] : SILHOUETTE, hl)}</g>
                {!altUnlocked && (
                  <g transform="translate(100 112)">
                    <rect x="-11" y="-4" width="22" height="18" rx="4" fill="#fff" opacity="0.9" />
                    <path d="M-6 -4 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
                  </g>
                )}
              </g>
            </>
          )}
          {animated && <Shell cw={cwA} className="core-shell" />}
        </>
      )}
    </svg>
  );
}
